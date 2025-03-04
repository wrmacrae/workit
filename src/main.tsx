// Learn more at developers.reddit.com/docs
import { Devvit, JSONObject, RedditAPIClient, RedisClient, SetStateAction, useAsync, useForm, useState } from '@devvit/public-api';
import { RepPicker } from './components/reppicker.js';
import { Exercise, ExerciseSummary } from './components/exercise.js';
import { ProgressBar } from './components/progressbar.js';
import { Menu } from './components/menu.js';
import { ExerciseData, WorkoutData, SetData, loadingWorkout } from './types.js';
import { strongLifts, supersetsWorkout, squat } from './examples.js';
import { Intro } from './components/intro.js';
import { keyForExerciseCollection, keyForTemplate, keyForWorkout, keyForSettings } from './keys.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

function makeWorkoutFromTemplate(templateWorkout: JSONObject) {
  return templateWorkout
}

function allSetsDone(data: WorkoutData) {
  for (const exercise of data.exercises) {
    if (!exercise.sets.every((set: SetData) => set.reps ?? 0 > 0)) {
      return false
    }
  }
  return true
}

function formatExerciseAsComment(exercise: ExerciseData) {
  var comment = `${exercise.name}: `
  const setsAsStrings = exercise.sets.filter((set: SetData) => set.reps).map((set: SetData) => `${set.reps}` + (set.weight ? ` at ${set.weight}` : ``))
  if (new Set(setsAsStrings).size == 1)
  {
    comment += `${setsAsStrings.length}x${setsAsStrings[0]}`
  } else {
    comment += setsAsStrings.join(", ")
  }
  return comment;
}

function formatWorkoutAsComment(workout: WorkoutData) {
  return workout.exercises.filter((exercise: ExerciseData) => !exercise.sets.every((set: SetData) => !set.reps)).map(formatExerciseAsComment).join("\n\n")
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

Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const [settings, setSettings] = useState({increment: 2.5})
    const [summaryMode, setSummaryMode] = useState(true)
    const [exerciseIndex, setExerciseIndex] = useState(0)
    const [repPickerIndices, setRepPickerIndices] = useState([])
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
    const asyncSettingsResult = useAsync(async () => {
      return JSON.parse((await context.redis.get(keyForSettings(context.userId!)) ?? "{}"))
    }, {
      depends: [context.userId!],
      finally: (settingsData, error) => {
        if (settingsData) {
          setSettings(settingsData)
        }
      }
    });
    const settingsForm = useForm(
      {
        fields: [
          {
            type: 'number',
            name: 'increment',
            label: "Weight Increment",
            required: true,
            defaultValue: settings.increment
          }
        ],
        title: "Change Workit Settings",
        acceptLabel: "Save",
      }, async (values) => {
        setSettings(values)
        await context.redis.set(keyForSettings(context.userId!) ?? "", JSON.stringify(values))
      }
    )
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

    const onRepsClick = (exerciseIndex: number) => (setIndex: number) => {
      setRepPickerIndices([exerciseIndex, setIndex])
    }

    const resetWorkout = () => {
      setWorkout(makeWorkoutFromTemplate(template))
      setPendingUpdates(prev => [...prev, makeWorkoutFromTemplate(template)]);
      setShowMenu(false)
      setExerciseIndex(0)
    }
    const returnToSummary = () => {
      setSummaryMode(true)
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
    const supersetGrid: ExerciseData[][] = workout.exercises.reduce((grid: ExerciseData[][], exercise: ExerciseData, index: number) => {
      if (index > 0 && workout.exercises[index - 1].superset) {
        grid[grid.length - 1].push(exercise)
      } else {
        grid.push([exercise])
      }
      return grid
    }, [])
    if (summaryMode) {
      return (
        <zstack height="100%" width="100%" alignment="center middle">
          <vstack grow height="100%" width="100%" alignment="center middle" gap="medium" padding='small' onPress={() => setSummaryMode(false)}>
            {supersetGrid.map((row) => <hstack grow width="100%" alignment="center middle" gap="small">{row.map((exercise: ExerciseData) => <ExerciseSummary exercise={exercise} />)}</hstack>)}
          </vstack>
          <vstack width="100%" height="100%" onPress={() => setSummaryMode(false)}></vstack> :
          <button appearance="primary" onPress={() => setSummaryMode(false)}>Do This Workout!</button>
        </zstack>
      )
    }
    return (
      <zstack height="100%" width="100%" alignment="start top">
        <ProgressBar setDonenesses={workout.exercises.map((exercise) => exercise.sets.map((set) => set.reps != undefined && set.reps > 0))} setExerciseIndex={setExerciseIndex} exerciseIndex={exerciseIndex}/>
        <vstack height="100%" width="100%" alignment="center middle">
          <vstack height="100%" width="100%" alignment="center middle" gap="small">
            {exerciseIndex > 0 ? <button icon="caret-up" onPress={() => setExerciseIndex(exerciseIndex - (showSupersets(context, workout, exerciseIndex-2) ? 2 : 1))}/> : <spacer height="40px"/>}
            {editMode ? <icon name="add" onPress={() => context.ui.showForm(insertExerciseForms[exerciseIndex])}/> : <hstack/>}
            <hstack width="100%" alignment="center middle">
              <Exercise
                exerciseIndex={exerciseIndex} setExerciseIndex={setExerciseIndex}
                increment={settings.increment}
                onRepsClick={onRepsClick(exerciseIndex)}
                editMode={editMode}
                context={context}
                workout={workout} setWorkout={setWorkout}
                template={template} setTemplate={setTemplate}
                setPendingUpdates={setPendingUpdates}
                setPendingTemplateUpdates={setPendingTemplateUpdates}
                repPickerIndices={repPickerIndices}
                /> 
              {showSupersets(context, workout, exerciseIndex) ?
              <hstack alignment="center middle">
                <spacer size="small" />
                <Exercise
                  exerciseIndex={exerciseIndex+1} setExerciseIndex={setExerciseIndex}
                  increment={settings.increment}
                  onRepsClick={onRepsClick(exerciseIndex+1)}
                  editMode={editMode}
                  context={context}
                  workout={workout} setWorkout={setWorkout}
                  template={template} setTemplate={setTemplate}
                  setPendingUpdates={setPendingUpdates}
                  setPendingTemplateUpdates={setPendingTemplateUpdates}
                  repPickerIndices={repPickerIndices}
                /> 
              </hstack>
              : <hstack/>}
            </hstack>
            {exerciseIndex + ((showSupersets(context, workout, exerciseIndex) ? 2 : 1)) < workout.exercises.length ?
              (workout.exercises[exerciseIndex].sets.every((set: SetData) => set.reps ?? 0 > 0) ?
                <button icon="caret-down" appearance="primary" onPress={() => setExerciseIndex(exerciseIndex + (showSupersets(context, workout, exerciseIndex) ? 2 : 1))}/> :
                <button icon="caret-down" onPress={() => setExerciseIndex(exerciseIndex + (showSupersets(context, workout, exerciseIndex) ? 2 : 1))}/>
              ) :
              <vstack>
                {editMode ? <icon name="add" onPress={() => context.ui.showForm(insertExerciseForms[workout.exercises.length])}/> : <hstack/>}
                {allSetsDone(workout) && !workout.complete ? <button appearance="primary" icon="checkmark-fill" onPress={completeWorkout}>Complete</button> : <button icon="checkmark-fill" onPress={completeWorkout}>Complete</button>}
              </vstack>
            }
          </vstack>
        </vstack>
        {repPickerIndices.length > 1 ? <RepPicker
                                          maxWidth={context.dimensions!.width}
                                          repPickerIndices={repPickerIndices} setRepPickerIndices={setRepPickerIndices}
                                          workout={workout} setWorkout={setWorkout}
                                          setExerciseIndex={setExerciseIndex}
                                          setPendingUpdates={setPendingUpdates}
                                        /> : <vstack />}
        {showMenu ?
        <vstack width="100%" height="100%" onPress={() => setShowMenu(false)}></vstack> :
        <vstack/> }
        <Menu settings={() => context.ui.showForm(settingsForm)} returnToSummary={returnToSummary} setShowMenu={setShowMenu} showMenu={showMenu} context={context}
          resetWorkout={resetWorkout} toggleEditMode={toggleEditMode} editMode={editMode}
          isAuthor={workout.author == context.userId}
          exerciseCollection={exerciseCollection}
        />
        {workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets.map((set: SetData) => set.reps ?? 0)).every((value: number) => value == 0) ?
        <Intro setRepPickerIndices={setRepPickerIndices} />
        :<vstack/>}
      </zstack>
    );
  },
});

export default Devvit;