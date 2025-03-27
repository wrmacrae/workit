// Learn more at developers.reddit.com/docs
import { Devvit, JobContext, JSONObject, Post, RedditAPIClient, RedisClient, SetStateAction, useAsync, useForm, useState } from '@devvit/public-api';
import { Exercise, ExerciseSummary } from './components/exercise.js';
import { ProgressBar } from './components/progressbar.js';
import { Menu } from './components/menu.js';
import { ExerciseData, WorkoutData, SetData, loadingWorkout, SettingsData } from './types.js';
import { strongLiftsA, strongLiftsB, supersetsWorkout, squat } from './examples.js';
import { Intro } from './components/intro.js';
import { keyForExerciseCollection, keyForTemplate, keyForWorkout, keyForSettings, keyForExerciseToLastCompletion, keyForUsersByLastCompletion, keyForAllWorkouts } from './keys.js';
import { PlateCalculator } from './components/platecalculator.js';
import { Timer } from './components/timer.js';
import { EmptyError } from './components/emptyerror.js';
import { IncompleteWarning } from './components/incompletewarning.js';
import { Completion } from './components/completion.js';
import { Next } from './components/next.js';
import { Summary } from './components/summary.js';
import { Stats } from './components/stats.js';
import { Achievements } from './components/achievements.js';
import { ExerciseInfo } from './components/exerciseinfo.js';
import { formatWorkoutAsComment } from './utils.js';
import { Log } from './components/log.js';

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
    workout.name = workout.name + ` (${(new Date(workout.complete ?? 0)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })})`
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

function makeWorkoutFromTemplate(templateWorkout: WorkoutData, lastCompletion: { [name: string]: SetData[] }, settings: SettingsData) {
  for (var exercise of templateWorkout.exercises) {
    if (lastCompletion.hasOwnProperty(exercise.name) && lastCompletion[exercise.name].length > 0 && lastCompletion[exercise.name][0].weight) {
      const previousSets : SetData[] = lastCompletion[exercise.name]
      if (previousSets.every((set: SetData) => (set.reps && set.target && set.reps >= set.target) || (set.time && set.targetTime && set.time >= set.targetTime))) {
        exercise.sets.map((set: SetData) => set.weight = lastCompletion[exercise.name][0].weight! + settings.increment)
      }
    }
  }
  for (var exercise of templateWorkout.optionalExercises ?? []) {
    if (lastCompletion.hasOwnProperty(exercise.name) && lastCompletion[exercise.name].length > 0 && lastCompletion[exercise.name][0].weight) {
      const previousSets : SetData[] = lastCompletion[exercise.name]
      if (previousSets.every((set: SetData) => (set.reps && set.target && set.reps >= set.target) || (set.time && set.targetTime && set.time >= set.targetTime))) {
        exercise.sets.map((set: SetData) => set.weight = lastCompletion[exercise.name][0].weight! + settings.increment)
      }
    }
  }
  return templateWorkout
}

function allSetsDone(data: WorkoutData) {
  for (const exercise of data.exercises) {
    if (!exercise.sets.every((set: SetData) => (set.reps ?? 0 > 0) || (set.time ?? 0 > 0))) {
      return false
    }
  }
  return true
}

function workoutIsEmpty(workout: WorkoutData) {
  return workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets.map((set: SetData) => (set.reps || set.time) ?? 0)).every((value: number) => value == 0);
}

async function addExerciseForUser(context: JobContext, exercise: ExerciseData) {
  await addExercisesForUser(context, {exercises: [exercise]})
}

async function addExercisesForUser(context: JobContext, workout: WorkoutData) {
  if (!workout.exercises || !workout.exercises.length) {
    return
  }
  const fieldValues = JSON.parse(JSON.stringify(workout.exercises)).reduce((acc, exercise: ExerciseData) => {
    delete exercise.superset
    acc[exercise.name] = JSON.stringify(exercise);
    return acc;
}, {});
  await context.redis.hSet(keyForExerciseCollection(context.userId!), fieldValues)
  if (workout.optionalExercises && workout.optionalExercises.length > 0) {
    const optionalFieldValues = JSON.parse(JSON.stringify(workout.optionalExercises)).reduce((acc, exercise: ExerciseData) => {
      delete exercise.superset
      acc[exercise.name] = JSON.stringify(exercise);
      return acc;
    }, {});
    await context.redis.hSet(keyForExerciseCollection(context.userId!), optionalFieldValues)
  }
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
  if ((!workout.exercises || workout.exercises.length == 0) && !workout.title) {
    return
  }
  const subredditName = (await context.reddit.getCurrentSubreddit()).name
  const post = await context.reddit.submitPost({
    title: workout.title ?? "New Workout",
    subredditName: subredditName,
    preview: (
      <Summary workout={workout} supersetGrid={workout.exercises.map((exercise) => [exercise])}/>
    ),
  });
  await context.redis.set(keyForTemplate(post.id), JSON.stringify(workout));
  await addExercisesForUser(context, workout)
  notifyUsers(context, post, workout)
  return post
}

async function notifyUsers(context: JobContext, post: Post, workout: WorkoutData) {
  // Users who finished last workout 0.0-2.5 days ago
  const users = await context.redis.zRange(keyForUsersByLastCompletion(), Date.now() - 216000000, Date.now(), { by: "score" })
  if (!workout.exercises.length) {
    return
  }
  for (const {member} of users) {
    const settings: SettingsData = JSON.parse((await context.redis.get(keyForSettings(member)) ?? "{}"))
    if (settings && !settings.notifications) {
      continue
    }
    const username = (await context.reddit.getUserById(member))!.username;
    context.reddit.sendPrivateMessage({
      subject: `New in Workit: ${post.title}`,
      text: `Exercises: ${workout.exercises.map((exercise => exercise.name)).join(", ")}\n\nThis new workout might be a good fit for you! ${post.url}`,
      to: username,
    })
  }
}

function supersetWithNext(context: Devvit.Context, workout: WorkoutData, index: number) {
  return index >= 0 && workout.exercises.length > index + 1 && context.dimensions!.width > 400 && workout.exercises[index].superset;
}
function supersetWithPrevious(context: Devvit.Context, workout: WorkoutData, index: number) {
  return index > 0 && supersetWithNext(context, workout, index - 1);
}
function makeSupersetGrid(workout: WorkoutData, context: Devvit.Context): ExerciseData[][] {
  return workout.exercises.reduce((grid: ExerciseData[][], exercise: ExerciseData, index: number) => {
    if (supersetWithPrevious(context, workout, index)) {
      grid[grid.length - 1].push(exercise);
    } else {
      grid.push([exercise]);
    }
    return grid;
  }, []);
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
    const [settings, setSettings] = useState<SettingsData>({increment: 5, barbellWeight: 45, notifications: true})
    const [summaryMode, setSummaryMode] = useState(true)
    const [exerciseIndex, setExerciseIndex] = useState(0)
    const [showCompletion, setShowCompletion] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [showAchievements, setShowAchievements] = useState(false)
    const [showLog, setShowLog] = useState(false)
    const [showExerciseInfo, setShowExerciseInfo] = useState<ExerciseData[]>([])
    const [plateCalculatorIndices, setPlateCalculatorIndices] = useState<number[]>([])
    const [showMenu, setShowMenu] = useState(false)
    const [showEmptyError, setShowEmptyError] = useState(false)
    const [showIncompleteWarning, setShowIncompleteWarning] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [workout, setWorkout] = useState<WorkoutData>(JSON.parse(JSON.stringify(loadingWorkout)))
    const [template, setTemplate] = useState<WorkoutData>(JSON.parse(JSON.stringify(loadingWorkout)))
    const [exerciseCollection, setExerciseCollection] = useState({squat: squat})
    const [pendingUpdates, setPendingUpdates] = useState([])
    const [lastCompletion, setLastCompletion] = useState({})
    const [pendingTemplateUpdates, setPendingTemplateUpdates] = useState([])
    const [workouts, setWorkouts] = useState<{member: string; score: number;}[]>([])
    const [newPostUrls, setNewPostUrls] = useState<string[]>([])
    const [newWorkouts, setNewWorkouts] = useState<WorkoutData[]>([])
    var { error } = useAsync(async () => {
      if (pendingUpdates.length > 0) {
        const latestUpdate = pendingUpdates[pendingUpdates.length - 1];
        await context.redis.set(keyForWorkout(context.postId!, context.userId!), JSON.stringify(latestUpdate));
        setPendingUpdates([]);
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
      const settings: SettingsData = JSON.parse((await context.redis.get(keyForSettings(context.userId!)) ?? "{}"))
      const workouts = await context.redis.zRange(keyForAllWorkouts(context.userId ?? "ANONYMOUS"), 0, Date.now())
      const newPosts = await context.reddit.getNewPosts({
        subredditName: (await context.reddit.getCurrentSubreddit()).name,
        limit: 1000,
        pageSize: 1000
      }).all()
      let newWorkouts = []
      let newPostUrls = []
      for (let post of newPosts) {
        const workout = JSON.parse(await context.redis.get(keyForWorkout(post.id, context.userId!)) ?? (await context.redis.get(keyForTemplate(post.id)) ?? JSON.stringify(loadingWorkout)))
        if (!workout.complete && workout.exercises.length) {
          newWorkouts.push(workout)
          newPostUrls.push(post.url)
          if (newWorkouts.length >= 4) {
            break;
          }
        }
      }
      return [startedWorkout, templateWorkout, lastCompletionData, settings, workouts, newWorkouts, newPostUrls]
    }, {
      depends: [context.postId!, context.userId!],
      finally: (loadedData : [string, string, {[k: string]: any}, SettingsData, {member: string; score: number;}[], WorkoutData[], string[]], error) => {
        var [startedWorkout, templateWorkout, lastCompletionData, settingsData, workouts, newWorkouts, newPostUrls] = loadedData
        setLastCompletion(lastCompletionData)
        if (!settingsData.hasOwnProperty("increment") || !settingsData.increment) {
          settingsData.increment = settings.increment
        }
        if (!settingsData.hasOwnProperty("barbellWeight") || !settingsData.barbellWeight) {
          settingsData.barbellWeight = settings.barbellWeight
        }
        if (!settingsData.hasOwnProperty("notifications")) {
          settingsData.notifications = settings.notifications
        }
        setSettings(settingsData)
        if (startedWorkout) {
          setWorkout(JSON.parse(startedWorkout))
        } else {
          setWorkout(makeWorkoutFromTemplate(JSON.parse(templateWorkout), lastCompletionData, settingsData)) // Load the workout template
        }
        setTemplate(JSON.parse(templateWorkout))
        setWorkouts(workouts)
        setNewWorkouts(newWorkouts)
        setNewPostUrls(newPostUrls)
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
          {
            type: 'boolean',
            name: 'notifications',
            label: "Receive Notification Messages?",
            required: true,
            defaultValue: settings.notifications
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
        newSettings.notifications = values.notifications
        setSettings(newSettings)
        await context.redis.set(keyForSettings(context.userId!) ?? "", JSON.stringify(newSettings))
      }
    )
    const optionalForm = useForm(
      {
        fields: [
          {
            type: 'select',
            name: 'exerciseName',
            label: 'Optional Exercise',
            required: true,
            options: (workout.optionalExercises ?? []).map(exercise => ({ label: exercise.name, value: exercise.name }))
          }
        ],
        title: 'Add an Optional Exercise',
        acceptLabel: 'Add to Workout'
      }, async (values) => {
        const optionIndex = workout.optionalExercises.findIndex(exercise => exercise.name == values.exerciseName)
        workout.exercises.push(...workout.optionalExercises.splice(optionIndex, 1))
        setWorkout(workout)
        setPendingUpdates(prev => [...prev, workout]);
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
      const newWorkout = makeWorkoutFromTemplate(template, lastCompletion, settings);
      setWorkout(newWorkout)
      setPendingUpdates(prev => [...prev, newWorkout]);
      setShowMenu(false)
      setExerciseIndex(0)
    }
    const returnToSummary = () => {
      setSummaryMode(true)
      setShowMenu(false)
    }

    const forceCompleteWorkout = () => {
      workout.complete = Date.now()
      setWorkout(workout)
      setPendingUpdates(prev => [...prev, workout]);
      context.reddit.submitComment({id: context.postId!, text: "I did this workout!\n\n" + formatWorkoutAsComment(workout) })
      const nameToSets = workout.exercises.reduce((acc, exercise: ExerciseData) => {
        acc[exercise.name] = JSON.stringify(exercise.sets)
        return acc
      }, {})
      context.redis.hSet(keyForExerciseToLastCompletion(context.userId!), nameToSets)
      context.redis.zAdd(keyForAllWorkouts(context.userId!), {member: context.postId!, score: Date.now()})
      context.redis.zAdd(keyForUsersByLastCompletion(), {member: context.userId!, score: Date.now()})
    }
    const completeWorkout = () => {
      if (workoutIsEmpty(workout)) {
        setShowEmptyError(true)
        return
      }
      if (!allSetsDone(workout)) {
        setShowIncompleteWarning(!showIncompleteWarning)
        return
      }
      forceCompleteWorkout()
    }
    
    const toggleEditMode = () => {
      setEditMode(!editMode)
      setShowMenu(false)
    }
    var supersetGrid: ExerciseData[][] = makeSupersetGrid(workout, context)
    const supersetDoneness: boolean[][][] = supersetGrid.map((superset: ExerciseData[]) => superset.map((exercise: ExerciseData) => exercise.sets.map((set: SetData) => Boolean(set.reps || set.time))))
    const advanceExercise = () => {
      setExerciseIndex(exerciseIndex + (supersetWithNext(context, workout, exerciseIndex) ? 2 : 1))
    }
    if (summaryMode || !workout.exercises) {
      return (
        <zstack height="100%" width="100%" alignment="start top">
          <Summary workout={workout} supersetGrid={supersetGrid} setSummaryMode={setSummaryMode} settings={() => context.ui.showForm(settingsForm)} returnToSummary={returnToSummary} setShowMenu={setShowMenu} showMenu={showMenu} context={context}
          resetWorkout={resetWorkout(lastCompletion)} toggleEditMode={toggleEditMode} editMode={editMode}
          isAuthor={workout.author == context.userId}
          exerciseCollection={exerciseCollection}
          stats={() => setShowStats(true)}
          achievements={() => setShowAchievements(true)}
          log={() => setShowLog(true)} supersetDoneness={supersetDoneness}
          setExerciseIndex={setExerciseIndex} exerciseIndex={exerciseIndex}
          newWorkouts={newWorkouts} newPostUrls={newPostUrls} />
          <Completion workout={workout} workouts={workouts} showCompletion={showCompletion} setShowCompletion={setShowCompletion} setSummaryMode={setSummaryMode}/>
          <Stats workout={workout} workouts={workouts} showStats={showStats} setShowStats={setShowStats} context={context} />
          <Achievements workout={workout} workouts={workouts} showAchievements={showAchievements} setShowAchievements={setShowAchievements} context={context} />
          <Log workout={workout} workouts={workouts} showLog={showLog} setShowLog={setShowLog} context={context} />
        </zstack>
      )
    }
    return (
      <zstack height="100%" width="100%" alignment="start top">
        <Timer workout={workout} exerciseIndex={exerciseIndex} />
        <Next workout={workout} supersetGrid={supersetGrid} exerciseIndex={exerciseIndex} addExercises={() => context.ui.showForm(optionalForm)}/>
        <hstack height="100%" width="100%" alignment="center middle" padding="small">
          <ProgressBar supersetDoneness={supersetDoneness} setExerciseIndex={setExerciseIndex} exerciseIndex={exerciseIndex} height={"80%"} setSummaryMode={setSummaryMode}/>
          <vstack grow alignment="center middle" gap="small">
            {exerciseIndex > 0 ? <button icon="caret-up" onPress={() => setExerciseIndex(exerciseIndex - (supersetWithNext(context, workout, exerciseIndex-2) ? 2 : 1))}/> : <button icon="back" onPress={returnToSummary}/>}
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
                setShowExerciseInfo={setShowExerciseInfo}
                /> 
              {supersetWithNext(context, workout, exerciseIndex) ?
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
                  setShowExerciseInfo={setShowExerciseInfo}
                  /> 
              </hstack>
              : <hstack/>}
            </hstack>
            {exerciseIndex + ((supersetWithNext(context, workout, exerciseIndex) ? 2 : 1)) < workout.exercises.length ?
              (workout.exercises[exerciseIndex].sets.every((set: SetData) => (set.reps ?? 0 > 0) || (set.time ?? 0 > 0)) ?
                <button icon="caret-down" appearance="primary" onPress={advanceExercise}/> :
                <button icon="caret-down" onPress={advanceExercise}/>
              ) :
              <vstack>
                {editMode ? <icon name="add" onPress={() => context.ui.showForm(insertExerciseForms[workout.exercises.length])}/> : <hstack/>}
                {workout.complete ?  <button icon="star-fill" appearance='primary' onPress={() => setShowCompletion(true)}>You Did It!</button> :
                (allSetsDone(workout) && !workout.complete ? <button appearance="primary" icon="checkmark-fill" onPress={completeWorkout}>Complete</button> : <button icon="checkmark-fill" onPress={completeWorkout}>Complete</button>)}
              </vstack>
            }
          </vstack>
        </hstack>
        {showMenu ?
        <vstack width="100%" height="100%" onPress={() => setShowMenu(false)}></vstack> :
        <vstack/> }
        <Menu settings={() => context.ui.showForm(settingsForm)} returnToSummary={returnToSummary} setShowMenu={setShowMenu} showMenu={showMenu} context={context}
          resetWorkout={resetWorkout(lastCompletion)} toggleEditMode={toggleEditMode} editMode={editMode}
          isAuthor={workout.author == context.userId}
          exerciseCollection={exerciseCollection}
          stats={() => {setShowStats(true); setShowMenu(false)}}
          achievements={() => {setShowAchievements(true); setShowMenu(false)}}
          log={() => {setShowLog(true); setShowMenu(false)}}
        />
        {showEmptyError ? <EmptyError setExerciseIndex={setExerciseIndex} setShowEmptyError={setShowEmptyError} /> : <vstack/>}
        {showIncompleteWarning ? <IncompleteWarning setExerciseIndex={setExerciseIndex} setShowIncompleteWarning={setShowIncompleteWarning} completeWorkout={forceCompleteWorkout} /> : <vstack/>}
        {workoutIsEmpty(workout) ?
        <Intro workouts={workouts.length}/>
        :<vstack/>}
        <PlateCalculator
          plateCalculatorIndices={plateCalculatorIndices} setPlateCalculatorIndices={setPlateCalculatorIndices}
          workout={workout} setWorkout={setWorkout}
          setPendingUpdates={setPendingUpdates}
          barbellWeight={settings.barbellWeight}
          />
        <ExerciseInfo showExerciseInfo={showExerciseInfo} setShowExerciseInfo={setShowExerciseInfo} workout={workout} workouts={workouts} context={context}/>
        <Completion workout={workout} workouts={workouts} showCompletion={showCompletion} setShowCompletion={setShowCompletion} setSummaryMode={setSummaryMode}/>
        <Stats workout={workout} workouts={workouts} showStats={showStats} setShowStats={setShowStats} context={context} />
        <Achievements workout={workout} workouts={workouts} showAchievements={showAchievements} setShowAchievements={setShowAchievements} context={context} />
        <Log workout={workout} workouts={workouts} showLog={showLog} setShowLog={setShowLog} context={context} />
      </zstack>
    );
  },
});

export default Devvit;