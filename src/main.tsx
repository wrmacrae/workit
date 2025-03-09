// Learn more at developers.reddit.com/docs
import { Devvit, JobContext, JSONObject, RedditAPIClient, RedisClient, SetStateAction, useAsync, useForm, useState } from '@devvit/public-api';
import { Exercise, ExerciseSummary } from './components/exercise.js';
import { ProgressBar } from './components/progressbar.js';
import { Menu } from './components/menu.js';
import { ExerciseData, WorkoutData, SetData, loadingWorkout } from './types.js';
import { strongLiftsA, strongLiftsB, supersetsWorkout, squat } from './examples.js';
import { Intro } from './components/intro.js';
import { keyForExerciseCollection, keyForTemplate, keyForWorkout, keyForSettings, keyForExerciseToLastCompletion } from './keys.js';
import { PlateCalculator } from './components/platecalculator.js';
import { Timer } from './components/timer.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

Devvit.addSettings([
  {
    name: 'daily-workouts',
    label: 'JSON List of Daily Workouts to Post',
    type: 'paragraph',
    scope: 'installation',
  }, {
    name: 'daily-workout-start',
    label: 'Milliseconds since epoch for first Daily Workout',
    type: 'number',
    scope: 'installation',
  }
])

function getDaysSince(startTime: number) {
  const millisecondsSince = Date.now() - startTime;
  const daysSince = millisecondsSince / 86400000;
  return Math.floor(daysSince);
}

Devvit.addSchedulerJob({
  name: 'daily-exercise',
  onRun: async (event, context) => {
    const workouts = JSON.parse(await context.settings.get('daily-workouts'))
    const workout = workouts[getDaysSince(await context.settings.get('daily-workout-start')) % workouts.length]
    makeWorkitPostForJob(context, workout)
  }
})

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => {
    try {
      const jobId = await context.scheduler.runJob({
        cron: '0 12 * * *',
        name: 'daily-exercise',
        data: {},
      });
      await context.redis.set('jobId', jobId);
    } catch (e) {
      console.log('error was not able to schedule:', e);
      throw e;
    }
  },
});

function makeWorkoutFromTemplate(templateWorkout: WorkoutData, lastCompletion: { [name: string]: SetData[] }) {
  for (var exercise: ExerciseData of templateWorkout.exercises) {
    if (lastCompletion.hasOwnProperty(exercise.name)) {
      exercise.sets.map((set: SetData) => set.weight = lastCompletion[exercise.name][0].weight)
    }
  }
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
    comment += `${setsAsStrings[0]}x${setsAsStrings.length}`
  } else {
    comment += setsAsStrings.join(", ")
  }
  return comment;
}

function formatWorkoutAsComment(workout: WorkoutData) {
  return "I did this workout!\n\n" + workout.exercises.filter((exercise: ExerciseData) => !exercise.sets.every((set: SetData) => !set.reps)).map(formatExerciseAsComment).join("\n\n")
}

async function addExerciseForUser(context: JobContext, exercise: ExerciseData) {
  await addExercisesForUser(context, {exercises: [exercise]})
}

async function addExercisesForUser(context: JobContext, workout: WorkoutData) {
  const fieldValues = workout.exercises.reduce((acc, exercise) => {
    delete exercise.superset
    acc[exercise.name] = JSON.stringify(exercise);
    return acc;
}, {});
  await context.redis.hSet(keyForExerciseCollection(context.userId!), fieldValues)
}

export async function makeWorkitPost(context: Devvit.Context, workout: WorkoutData) {
  context.ui.showToast("Submitting your post - upon completion you'll navigate there.");
  const post = await makeWorkitPostForJob(context, workout)
  if (post) {
    context.ui.navigateTo(post)
  }
}

async function makeWorkitPostForJob(context: JobContext, workout: WorkoutData) {
  workout.author = context.userId!
  if (!workout.exercises || workout.exercises.length == 0) {
    return
  }
  const subredditName = (await context.reddit.getCurrentSubreddit()).name
  const post = await context.reddit.submitPost({
    title: workout.title ?? "New Workout",
    subredditName: subredditName,
    preview: (
      <vstack>
        <text color="black white">Loading workout...</text>
        </vstack>
    ),
  });
  await context.redis.set(keyForTemplate(post.id), JSON.stringify(workout));
  await addExercisesForUser(context, workout)
  return post
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
    const [settings, setSettings] = useState({increment: 5, barbellWeight: 45})
    const [summaryMode, setSummaryMode] = useState(true)
    const [exerciseIndex, setExerciseIndex] = useState(0)
    const [plateCalculatorIndices, setPlateCalculatorIndices] = useState<number[]>([])
    const [showMenu, setShowMenu] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [workout, setWorkout] = useState<WorkoutData>(loadingWorkout)
    const [template, setTemplate] = useState<WorkoutData>(loadingWorkout)
    const [exerciseCollection, setExerciseCollection] = useState({squat: squat})
    const [pendingUpdates, setPendingUpdates] = useState([]);
    const [lastCompletion, setLastCompletion] = useState({});
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
      const startedWorkout = await context.redis.get(keyForWorkout(context.postId!, context.userId!)) // User started a workout already
      const templateWorkout = await context.redis.get(keyForTemplate(context.postId!))
      // TODO Don't load completion data for a started workout
      const rawCompletionData: Record<string, string> = await context.redis.hGetAll(keyForExerciseToLastCompletion(context.userId!) ?? {})
      const lastCompletionData = Object.fromEntries(
        Object.entries(rawCompletionData).map(([key, value]) => [key, JSON.parse(value)])
      );
      return [startedWorkout, templateWorkout, lastCompletionData]
    }, {
      depends: [context.postId!, context.userId!],
      finally: (loadedData : [string, string, {[k: string]: any}], error) => {
        var [startedWorkout, templateWorkout, lastCompletionData] = loadedData
        setLastCompletion(lastCompletionData)
        if (startedWorkout) {
          setWorkout(JSON.parse(startedWorkout))
        } else {
          setWorkout(makeWorkoutFromTemplate(JSON.parse(templateWorkout), lastCompletion)) // Load the workout template
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
      addExercisesForUser(context, strongLiftsA)
      addExercisesForUser(context, strongLiftsB)
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
        if (!settingsData.hasOwnProperty("increment") || !settingsData.increment) {
          settingsData.increment = settings.increment
        }
        if (!settingsData.hasOwnProperty("barbellWeight") || !settingsData.barbellWeight) {
          settingsData.barbellWeight = settings.barbellWeight
        }
        setSettings(settingsData)
      }
    });
    const settingsForm = useForm(
      {
        fields: [
          {
            type: 'string',
            name: 'increment',
            label: "Weight Increment",
            required: true,
            defaultValue: String(settings.increment)
          },
          {
            type: 'string',
            name: 'barbellWeight',
            label: "Barbell Weight",
            required: true,
            defaultValue: String(settings.barbellWeight)
          },
        ],
        title: "Change Workit Settings",
        acceptLabel: "Save",
      }, async (values) => {
        const newSettings = settings
        if (Number(values.increment) && Number(values.increment) > 0) {
          newSettings.increment = Number(values.increment)
        }
        if (Number(values.barbellWeight) && Number(values.barbellWeight) > 0) {
          newSettings.barbellWeight = Number(values.barbellWeight)
        }
        setSettings(settings)
        await context.redis.set(keyForSettings(context.userId!) ?? "", JSON.stringify(settings))
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

    const resetWorkout = (lastCompletion: { [x: string]: SetData[]; }) => () => {
      setWorkout(makeWorkoutFromTemplate(template, lastCompletion))
      setPendingUpdates(prev => [...prev, makeWorkoutFromTemplate(template, lastCompletion)]);
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
      const nameToSets = workout.exercises.reduce((acc, exercise: ExerciseData) => {
        acc[exercise.name] = JSON.stringify(exercise.sets)
        return acc
      }, {})
      context.redis.hSet(keyForExerciseToLastCompletion(context.userId!), nameToSets)
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
    const advanceExercise = () => {
      setExerciseIndex(exerciseIndex + (showSupersets(context, workout, exerciseIndex) ? 2 : 1))
    }
    if (summaryMode) {
      return (
        <zstack height="100%" width="100%" alignment="center middle">
          <vstack grow height="100%" width="100%" alignment="center middle" gap="medium" padding='small' onPress={() => setSummaryMode(false)}>
            {supersetGrid.map((row) => <hstack grow width="100%" alignment="center middle" gap="small">{row.map((exercise: ExerciseData) => <ExerciseSummary exercise={exercise} context={context} />)}</hstack>)}
          </vstack>
          <vstack width="100%" height="100%" onPress={() => setSummaryMode(false)}></vstack> :
          <button appearance="primary" onPress={() => setSummaryMode(false)}>Do This Workout!</button>
        </zstack>
      )
    }
    return (
      <zstack height="100%" width="100%" alignment="start top">
        <Timer workout={workout} />
        <ProgressBar setDonenesses={workout.exercises.map((exercise) => exercise.sets.map((set) => set.reps != undefined && set.reps > 0))} setExerciseIndex={setExerciseIndex} exerciseIndex={exerciseIndex}/>
        <vstack height="100%" width="100%" alignment="center middle">
          <vstack height="100%" width="100%" alignment="center middle" gap="small">
            {exerciseIndex > 0 ? <button icon="caret-up" onPress={() => setExerciseIndex(exerciseIndex - (showSupersets(context, workout, exerciseIndex-2) ? 2 : 1))}/> : <button icon="back" onPress={returnToSummary}/>}
            {editMode ? <icon name="add" onPress={() => context.ui.showForm(insertExerciseForms[exerciseIndex])}/> : <hstack/>}
            <hstack width="100%" alignment="center middle">
              <Exercise
                context={context}
                workout={workout} setWorkout={setWorkout}
                exerciseIndex={exerciseIndex} setExerciseIndex={setExerciseIndex}
                increment={settings.increment}
                editMode={editMode}
                template={template} setTemplate={setTemplate}
                setPendingUpdates={setPendingUpdates}
                setPendingTemplateUpdates={setPendingTemplateUpdates}
                plateCalculatorIndices={plateCalculatorIndices} setPlateCalculatorIndices={setPlateCalculatorIndices}
                /> 
              {showSupersets(context, workout, exerciseIndex) ?
              <hstack alignment="center middle">
                <spacer size="small" />
                <Exercise
                  context={context}
                  workout={workout} setWorkout={setWorkout}
                  exerciseIndex={exerciseIndex+1} setExerciseIndex={setExerciseIndex}
                  increment={settings.increment}
                  editMode={editMode}
                  template={template} setTemplate={setTemplate}
                  setPendingUpdates={setPendingUpdates}
                  setPendingTemplateUpdates={setPendingTemplateUpdates}
                  plateCalculatorIndices={plateCalculatorIndices} setPlateCalculatorIndices={setPlateCalculatorIndices}
                  /> 
              </hstack>
              : <hstack/>}
            </hstack>
            {exerciseIndex + ((showSupersets(context, workout, exerciseIndex) ? 2 : 1)) < workout.exercises.length ?
              (workout.exercises[exerciseIndex].sets.every((set: SetData) => set.reps ?? 0 > 0) ?
                <button icon="caret-down" appearance="primary" onPress={advanceExercise}/> :
                <button icon="caret-down" onPress={advanceExercise}/>
              ) :
              <vstack>
                {editMode ? <icon name="add" onPress={() => context.ui.showForm(insertExerciseForms[workout.exercises.length])}/> : <hstack/>}
                {workout.complete ?  <button icon="star-fill">You Did It!</button> :
                (allSetsDone(workout) && !workout.complete ? <button appearance="primary" icon="checkmark-fill" onPress={completeWorkout}>Complete</button> : <button icon="checkmark-fill" onPress={completeWorkout}>Complete</button>)}
              </vstack>
            }
          </vstack>
        </vstack>
        {showMenu ?
        <vstack width="100%" height="100%" onPress={() => setShowMenu(false)}></vstack> :
        <vstack/> }
        <Menu settings={() => context.ui.showForm(settingsForm)} returnToSummary={returnToSummary} setShowMenu={setShowMenu} showMenu={showMenu} context={context}
          resetWorkout={resetWorkout(lastCompletion)} toggleEditMode={toggleEditMode} editMode={editMode}
          isAuthor={workout.author == context.userId}
          exerciseCollection={exerciseCollection}
        />
        {workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets.map((set: SetData) => set.reps ?? 0)).every((value: number) => value == 0) ?
        <Intro/>
        :<vstack/>}
        <PlateCalculator
          plateCalculatorIndices={plateCalculatorIndices} setPlateCalculatorIndices={setPlateCalculatorIndices}
          workout={workout} setWorkout={setWorkout}
          setPendingUpdates={setPendingUpdates}
          barbellWeight={settings.barbellWeight}
          />
      </zstack>
    );
  },
});

export default Devvit;