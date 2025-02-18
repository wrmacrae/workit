// Learn more at developers.reddit.com/docs
import { Devvit, JSONObject, RedditAPIClient, RedisClient, useAsync, useForm, useState } from '@devvit/public-api';
import { RepPicker } from './components/reppicker.js';
import { Exercise } from './components/exercise.js';
import { ProgressBar } from './components/progressbar.js';
import { Menu } from './components/menu.js';
import { ExerciseData, WorkoutData, SetData, loadingWorkout } from './types.js';
import { strongLifts, supersetsWorkout, squat } from './examples.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

function keyForWorkout(postId: string, userId: string) {
  return `workout-for-post-${postId}-for-user-${userId}`
}

function keyForTemplate(postId: string) {
  return `template-for-post-${postId}`
}

function keyForExerciseCollection(userId: string) {
  return `exercise-collection-for-user-${userId}`
}
//TODO: Store this stuff
function keyForAllWorkouts(userId: string) {
  return `all-workouts-for-user-${userId}`
}
//TODO: Store this stuff
function keyForAllTemplates(userId: string) {
  return `all-templates-for-user-${userId}`
}

//TODO: Store this stuff
function keyForExerciseToLastSet(userId: string) {
  return `exercise-to-last-set-for-user-${userId}`
}

function makeWorkoutFromTemplate(templateWorkout: JSONObject) {
  return templateWorkout
}

function allSetsDone(data) {
  for (const exercise of data.exercises) {
    if (!exercise.sets.every((set) => set.reps > 0)) {
      return false
    }
  }
  return true
}

function formatExerciseAsComment(exercise: ExerciseData) {
  var comment = `${exercise.name}: `
  const setsAsStrings = exercise.sets.map((set) => `${set.reps}` + (set.weight ? ` at ${set.weight}` : ``))
  if (new Set(setsAsStrings).size == 1)
  {
    comment += `${exercise.sets.length}x${setsAsStrings[0]}`
  } else {
    comment += setsAsStrings.join(", ")
  }
  return comment;
}

function formatWorkoutAsComment(workout: WorkoutData) {
  return workout.exercises.map(formatExerciseAsComment).join("\n\n")
}

async function addExerciseForUser(context: Devvit.Context, exercise: ExerciseData) {
  await addExercisesForUser(context, {exercises: [exercise]})
}

async function addExercisesForUser(context: Devvit.Context, workout: WorkoutData) {
  const fieldValues = workout.exercises.reduce((acc, exercise) => {
    delete exercise.superset
    acc[exercise.name] = JSON.stringify(exercise);
    return acc;
}, {});
  await context.redis.hSet(keyForExerciseCollection(context.userId!), fieldValues)
}

export async function makeWorkitPost(context: Devvit.Context, title: string, workout: WorkoutData) {
  workout.author = context.userId!
  context.ui.showToast("Submitting your post - upon completion you'll navigate there.");
  const subredditName = (await context.reddit.getCurrentSubreddit()).name
  const post = await context.reddit.submitPost({
    title: title,
    subredditName: subredditName,
    preview: (
      <vstack>
        <text color="black white">Loading workout...</text>
        </vstack>
    ),
  });
  await context.redis.set(keyForTemplate(post.id), JSON.stringify(workout));
  await addExercisesForUser(context, workout)
  context.ui.navigateTo(post)
}

Devvit.addMenuItem({
  label: 'New Strong Lifts',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await makeWorkitPost(context, "Strong Lifts Day 1", strongLifts)
  },
});

Devvit.addMenuItem({
  label: 'New Supersets Workout',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await makeWorkitPost(context, "Legs and Abs", supersetsWorkout)
  },
});

function showSupersets(context: Devvit.Context, workout: WorkoutData, exerciseIndex: number) {
  return exerciseIndex >= 0 && workout.exercises.length > exerciseIndex + 1 && context.dimensions!.width > 400 && workout.exercises[exerciseIndex].superset;
}
function mergeArrays(...arrays: any[][]) {
  return arrays[0].map((_, i) =>
      Object.assign({}, ...arrays.map(arr => arr[i]))
  );
}

function createSetsFromInputStrings(sets: number, targets: string, weights: string | undefined) {
  const targetValues = targets.split(',').map(target => target.trim());
  const lastValue = targetValues[targetValues.length - 1];
  const targetArray = Array.from(Array(sets), (_, i) => ({
    target: targetValues[i] !== undefined ? targetValues[i] : lastValue
  }));
  var weightArray = Array(sets).fill({});
  if (weights != undefined) {
    const weightValues = weights.split(',').map(weight => weight.trim());
    const lastValue = weightValues[weightValues.length - 1];
    weightArray = Array.from(Array(sets), (_, i) => ({
      weight: weightValues[i] !== undefined ? weightValues[i] : lastValue
    }));
  }
  const setsArray = mergeArrays(targetArray, weightArray);
  return setsArray;
}

function getWeightsAsString(workout: WorkoutData, exerciseIndex: number): string {
  const weights = new Set(workout.exercises[exerciseIndex].sets.map((set: SetData) => set.weight))
  if (weights.size == 1) {
    return `${weights.values().next().value}` == "undefined" ? "" : `${weights.values().next().value}`
  }
  return workout.exercises[exerciseIndex].sets.filter((set) =>
    set.weight != undefined).map((set) =>
    set.weight?.toString()).join(", ");
}

function getTargetsAsString(workout: WorkoutData, exerciseIndex: number): string {
  const targets = new Set(workout.exercises[exerciseIndex].sets.map((set: SetData) => set.target))
  if (targets.size == 1) {
    return `${targets.values().next().value}` == "undefined" ? "" : `${targets.values().next().value}`
  }
  return workout.exercises[exerciseIndex].sets.filter((set) =>
    set.target != undefined).map((set) =>
    set.target?.toString()).join(", ");
}

export async function createExerciseFromForm(values: { exerciseName: string; } & { image: string; } & { sets: number; } & { targets: string; } & { weights?: string | undefined; } & { [key: string]: any; }, context: Devvit.Context) {
  const { exerciseName, image, sets, targets, weights } = values;
  try {
    const response = await context.media.upload({
      url: image,
      type: 'image',
    });
  } catch (error) {
    console.log(error)
  }
  const setsArray = createSetsFromInputStrings(sets, targets, weights);
  const exercise = {
    name: exerciseName,
    image: image,
    sets: setsArray
  };
  addExerciseForUser(context, exercise);
  return exercise
}

function withoutReps(exercise: ExerciseData) {
  for (var set of exercise.sets) {
    delete set.reps
  }
  return exercise
}

Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const increment = 2.5
    const [exerciseIndex, setExerciseIndex] = useState(0)
    const [repPicker, setRepPicker] = useState([-1])
    const [showMenu, setShowMenu] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [workout, setWorkout] = useState<WorkoutData>(loadingWorkout)
    const [template, setTemplate] = useState<WorkoutData>(loadingWorkout)
    const [exerciseCollection, setExerciseCollection] = useState({squat: squat})
    const [pendingUpdates, setPendingUpdates] = useState([]);
    const [pendingTemplateUpdates, setPendingTemplateUpdates] = useState([]);
    var { error } = useAsync(async () => {
      while (pendingUpdates.length > 0) {
        const nextUpdate = pendingUpdates.shift()
        await context.redis.set(keyForWorkout(context.postId!, context.userId!), JSON.stringify(nextUpdate));
        setPendingUpdates(pendingUpdates);
      }
    }, {
      depends: [pendingUpdates],
    });
    if (error) {
      console.error('Failed to save workout to Redis:', error);
    }
    ({ error } = useAsync(async () => {
      if (pendingTemplateUpdates.length > 0) {
        const latestUpdate = pendingTemplateUpdates[pendingTemplateUpdates.length - 1];
        await context.redis.set(keyForTemplate(context.postId!), JSON.stringify(latestUpdate));
        setPendingTemplateUpdates([]);
      }
    }, {
      depends: [pendingUpdates],
    }));
    if (error) {
      console.error('Failed to save workout to Redis:', error);
    }
    const asyncDataResult = useAsync(async () => {
      var startedWorkout = await context.redis.get(keyForWorkout(context.postId!, context.userId!)) // User started a workout already
      var templateWorkout = await context.redis.get(keyForTemplate(context.postId!))
      return [startedWorkout, templateWorkout]
    }, {
      depends: [context.postId!, context.userId!],
      finally: (loadedData : [string, string], error) => {
        var [startedWorkout, templateWorkout] = loadedData
        if (startedWorkout) {
          setWorkout(JSON.parse(startedWorkout))
        } else {
          setWorkout(makeWorkoutFromTemplate(JSON.parse(templateWorkout))) // Load the workout template
        }
        setTemplate(JSON.parse(templateWorkout))
      }
    });
    if (asyncDataResult.loading) {
      return <text>Loading Workout from Redis...</text>;
    }
    if (asyncDataResult.error) {
      return <text>Error: {asyncDataResult.error.message}</text>;
    }
    const asyncExerciseCollectionResult = useAsync(async () => {
      addExercisesForUser(context, strongLifts)
      addExercisesForUser(context, supersetsWorkout)
      const rawData: Record<string, string> = await context.redis.hGetAll(keyForExerciseCollection(context.userId!));
      return Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, JSON.parse(value)])
      );
    }, {
      depends: [context.userId!],
      finally: (loadedData, error) => {
        if (loadedData) {
          setExerciseCollection(loadedData)
        }
      }
    });
    if (asyncExerciseCollectionResult.loading) {
      return <text>Loading Exercise Collection from Redis...</text>;
    }
    if (asyncExerciseCollectionResult.error) {
      return <text>Error: {asyncExerciseCollectionResult.error.message}</text>;
    }
    const insertExerciseForms = [...Array(workout.exercises.length+1).keys()].map((exerciseIndex) => useForm(
      {
        fields: [
          {
            type: 'string',
            name: 'exerciseName',
            label: 'Exercise Name',
            required: true,
          },
          {
            type: 'image',
            name: 'image',
            label: 'Exercise Image',
            required: true,
          },
          {
            type: 'number',
            name: 'sets',
            label: 'Number of Sets',
            required: true,
          },
          {
            type: 'string',
            name: 'targets',
            label: 'Target reps per set (or comma-separated list of reps)',
            required: true,
          },
          {
            type: 'string',
            name: 'weights',
            label: 'Weight (or comma-separated list of weights)',
            required: false,
          },
         ],
         title: 'Create and Insert a New Exercise',
         acceptLabel: 'Insert into Workout',
      }, async (values) => {
        const newExercise = await createExerciseFromForm(values, context);
        workout.exercises.splice(exerciseIndex, 0, newExercise)
        setWorkout(workout)
        setPendingUpdates(prev => [...prev, workout]);
        template.exercises.splice(exerciseIndex, 0, newExercise)
        setTemplate(template)
        setPendingTemplateUpdates(prev => [...prev, template])
      }
    ));
    const editForms = [...Array(workout.exercises.length).keys()].map((exerciseIndex) => useForm(
      (data) => ({
        fields: [
          {
            type: 'string',
            name: 'exerciseName',
            label: 'Exercise Name',
            required: true,
            defaultValue: data.workout.exercises[exerciseIndex].name
          },
          {
            type: 'image',
            name: 'image',
            label: 'Exercise Image (Leave blank to keep original)',
            required: false,
          },
          {
            type: 'number',
            name: 'sets',
            label: 'Number of Sets',
            required: true,
            defaultValue: data.workout.exercises[exerciseIndex].sets.length
          },
          {
            type: 'string',
            name: 'targets',
            label: 'Target reps per set (or comma-separated list of reps)',
            required: true,
            defaultValue: getTargetsAsString(data.workout, exerciseIndex)
          },
          {
            type: 'string',
            name: 'weights',
            label: 'Weight (or comma-separated list of weights)',
            required: false,
            defaultValue: getWeightsAsString(data.workout, exerciseIndex)
          },
         ],
         title: 'Edit this Exercise',
         acceptLabel: 'Edit',
      }), async (values) => {
        if (values.image == undefined) {
          values.image = workout.exercises[exerciseIndex].image
        }
        const newExercise = await createExerciseFromForm(values, context);
        workout.exercises[exerciseIndex] = newExercise
        setWorkout(workout)
        setPendingUpdates(prev => [...prev, workout]);
        template.exercises[exerciseIndex] = withoutReps(newExercise)
        setTemplate(template)
        setPendingTemplateUpdates(prev => [...prev, template])
    }));
    const onRepsClick = (exerciseIndex: number) => (setIndex: number) => {
      setRepPicker([exerciseIndex, setIndex])
    }
    const setRepsForIndices = (indices: number[]) => (reps: number) => {
      //TODO: Do I need to copy this way here and 3 similar places below?
      const newWorkout = JSON.parse(JSON.stringify(workout))
      newWorkout.exercises[indices[0]].sets[indices[1]].reps = reps
      newWorkout.exercises[indices[0]].sets[indices[1]].repsEnteredTime = Date.now()
      setWorkout(newWorkout)
      setRepPicker([])
      setPendingUpdates(prev => [...prev, newWorkout]);

    };
    const increaseWeightForIndices = (exerciseIndex: number) => (setIndex: number) => {
      const newWorkout = JSON.parse(JSON.stringify(workout))
      const newWeight = newWorkout.exercises[exerciseIndex].sets[setIndex].weight + increment
      newWorkout.exercises[exerciseIndex].sets[setIndex].weight = newWeight
      setIndex++
      while (setIndex < newWorkout.exercises[exerciseIndex].sets.length) {
        if (!newWorkout.exercises[exerciseIndex].sets[setIndex].reps) {
          newWorkout.exercises[exerciseIndex].sets[setIndex].weight = newWeight
        }
        setIndex++
      }
      setWorkout(newWorkout)
      setPendingUpdates(prev => [...prev, newWorkout]);
    }
    const decreaseWeightForIndices = (exerciseIndex: number) => (setIndex: number) => {
      const newWorkout = JSON.parse(JSON.stringify(workout))
      const newWeight = newWorkout.exercises[exerciseIndex].sets[setIndex].weight - increment
      newWorkout.exercises[exerciseIndex].sets[setIndex].weight = newWeight
      setIndex++
      while (setIndex < newWorkout.exercises[exerciseIndex].sets.length) {
        if (!newWorkout.exercises[exerciseIndex].sets[setIndex].reps) {
          newWorkout.exercises[exerciseIndex].sets[setIndex].weight = newWeight
        }
        setIndex++
      }
      setWorkout(newWorkout)
      setPendingUpdates(prev => [...prev, newWorkout]);
    }
    const editExercise = (exerciseIndex: number) => {
      context.ui.showForm(editForms[exerciseIndex], {workout: workout})
    }
    const deleteExercise = (index: number) => {
      workout.exercises.splice(index, 1)
      setWorkout(workout)
      setPendingUpdates(prev => [...prev, workout]);
      template.exercises.splice(index, 1)
      setTemplate(template)
      setPendingTemplateUpdates(prev => [...prev, template])
      if (exerciseIndex >= workout.exercises.length) {
        setExerciseIndex(workout.exercises.length - 1)
      }
    }
    const resetWorkout = () => {
      setWorkout(makeWorkoutFromTemplate(template))
      setPendingUpdates(prev => [...prev, makeWorkoutFromTemplate(template)]);
      setShowMenu(false)
    }
    const completeWorkout = () => {
      workout.complete = Date.now()
      setWorkout(workout)
      setPendingUpdates(prev => [...prev, workout]);
      context.reddit.submitComment({id: context.postId!, text: formatWorkoutAsComment(workout) })
    }
    const toggleEditMode = () => {
      setEditMode(!editMode)
      setShowMenu(false)
    }

    return (
      <zstack height="100%" width="100%" alignment="start top">
        <hstack height="100%" width="100%" alignment="center middle">
          <vstack height="100%" width="100%" alignment="center middle" gap="small">
            {exerciseIndex > 0 ? <icon name="caret-up" onPress={() => setExerciseIndex(exerciseIndex - (showSupersets(context, workout, exerciseIndex-2) ? 2 : 1))}/> : <spacer size="medium"/>}
            {editMode ? <icon name="add" onPress={() => context.ui.showForm(insertExerciseForms[exerciseIndex])}/> : <hstack/>}
            <hstack width="100%" alignment="center middle">
              <Exercise
                name={workout.exercises[exerciseIndex].name}
                image={workout.exercises[exerciseIndex].image ?? workout.exercises[exerciseIndex].name.toLowerCase().replaceAll(" ", "") + ".gif"}
                sets={workout.exercises[exerciseIndex].sets}
                onRepsClick={onRepsClick(exerciseIndex)}
                increaseWeightForIndex={increaseWeightForIndices(exerciseIndex)}
                decreaseWeightForIndex={decreaseWeightForIndices(exerciseIndex)}
                edit={editMode ? () => editExercise(exerciseIndex) : undefined}
                delete={editMode ? () => deleteExercise(exerciseIndex) : undefined}
                /> 
              {showSupersets(context, workout, exerciseIndex) ?
              <hstack alignment="center middle">
                <spacer size="small" />
                <Exercise
                  name={workout.exercises[exerciseIndex+1].name}
                  image={workout.exercises[exerciseIndex+1].image ?? workout.exercises[exerciseIndex+1].name.toLowerCase().replaceAll(" ", "") + ".gif"}
                  sets={workout.exercises[exerciseIndex+1].sets}
                  onRepsClick={onRepsClick(exerciseIndex+1)}
                  increaseWeightForIndex={increaseWeightForIndices(exerciseIndex+1)}
                  decreaseWeightForIndex={decreaseWeightForIndices(exerciseIndex+1)}
                  edit={editMode ? () => editExercise(exerciseIndex+1) : undefined}
                  delete={editMode ? () => deleteExercise(exerciseIndex+1) : undefined}
                /> 
              </hstack>
              : <hstack/>}
            </hstack>
            {exerciseIndex + ((showSupersets(context, workout, exerciseIndex) ? 2 : 1)) < workout.exercises.length ?
              <icon size="medium" name="caret-down" onPress={() => setExerciseIndex(exerciseIndex + (showSupersets(context, workout, exerciseIndex) ? 2 : 1))}/> :
              <vstack>
                {editMode ? <icon name="add" onPress={() => context.ui.showForm(insertExerciseForms[workout.exercises.length])}/> : <hstack/>}
                {allSetsDone(workout) && !workout.complete ? <button icon="checkmark-fill" onPress={completeWorkout}>Complete</button> : <spacer size="medium"/>}
              </vstack>
            }
          </vstack>
          <ProgressBar setDonenesses={workout.exercises.flatMap((exercise) => exercise.sets).map((set) => set.reps != undefined && set.reps > 0)}/>
        </hstack>
        {repPicker.length > 1 ? <RepPicker maxWidth={context.dimensions!.width} setReps={setRepsForIndices(repPicker)} closePicker={() => setRepPicker([])}></RepPicker> : <vstack />}
        {showMenu ?
        <vstack width="100%" height="100%" onPress={() => setShowMenu(false)}></vstack> :
        <vstack/> }
        <Menu setShowMenu={setShowMenu} showMenu={showMenu} context={context}
          resetWorkout={resetWorkout} toggleEditMode={toggleEditMode} editMode={editMode}
          isAuthor={workout.author == context.userId}
          exerciseCollection={exerciseCollection}
        />
      </zstack>
    );
  },
});

export default Devvit;