// Learn more at developers.reddit.com/docs
import { Devvit, JSONObject, RedditAPIClient, RedisClient, useAsync, useForm, useState } from '@devvit/public-api';
import { RepPicker } from './components/reppicker.js';
import { Exercise } from './components/exercise.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

function keyForPostAndUser(postId: string, userId: string) {
  return `post-${postId}-user-${userId}`
}

function keyForPost(postId: string) {
  return `post-${postId}`
}

function makeWorkoutFromTemplat(templateWorkout: JSONObject) {
  templateWorkout.complete = false
  return templateWorkout
}

const strongLifts = {
  exercises: [
    {
      name: "Squat",
      image: "squat.gif",
      sets:
      [
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
      ],      
    },
    {
      name: "Bench Press",
      image: "benchpress.gif",
      sets:
      [
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
      ],      
    },
    {
      name: "Barbell Row",
      image: "barbellrow.gif",
      sets:
      [
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
        {
          target: 5,
          weight: 45
        },
      ],      
    },
  ]
}

const supersetsWorkout = {
  exercises: [
    {
      name: "Weighted Lunge",
      image: "weightedlunge.gif",
      superset: true,
      sets:
      [
        {
          target: 15,
          weight: 15
        },
        {
          target: 12,
          weight: 15
        },
        {
          target: 10,
          weight: 15
        },
      ],
    },
    {
      name: "Spiderman Plank Crunch",
      image: "spidermanplankcrunch.gif",
      sets:
      [
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 15,
        },
      ],
    },
    {
      name: "Squat",
      image: "squat.gif",
      superset: true,
      sets:
      [
        {
          target: 15,
          weight: 45
        },
        {
          target: 12,
          weight: 45
        },
        {
          target: 10,
          weight: 45
        },
      ],
    },
    {
      name: "Leg Lift",
      image: "leglift.gif",
      sets:
      [
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 15,
        },
      ],
    },
    {
      name: "Hip Thrust",
      image: "hipthrust.gif",
      superset: true,
      sets:
      [
        {
          target: 15,
          weight: 45
        },
        {
          target: 12,
          weight: 45
        },
        {
          target: 10,
          weight: 45
        },
      ],
    },
    {
      name: "Jackknife Crunch",
      image: "jackknifecrunch.gif",
      sets:
      [
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 15,
        },
      ],
    },    {
      name: "Calf Raise",
      image: "calfraise.gif",
      superset: true,
      sets:
      [
        {
          target: 15,
          weight: 45
        },
        {
          target: 12,
          weight: 45
        },
        {
          target: 10,
          weight: 45
        },
      ],
    },
    {
      name: "Bicycle",
      image: "bicycle.gif",
      sets:
      [
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 15,
        },
      ],
    },
  ]
}

function allSetsDone(data) {
  for (const exercise of data.exercises) {
    if (!exercise.sets.every((set) => set.reps > 0)) {
      return false
    }
  }
  return true
}

function formatDataAsComment(data) {
  var comment = ""
  for (const exercise of data.exercises) {
    comment += `${exercise}:\n\n`
    const setsAsStrings = exercise.sets.map((set) => `${set.reps} at ${set.weight}`)
    if (new Set(setsAsStrings).size == 1)
    {
      comment += `${exercise.sets.length}x${setsAsStrings[0]}`
    } else {
      comment += setsAsStrings.join(", ")
    }
  }
  return comment
}

async function makeWorkitPost(context: Devvit.Context, title: string, workout: JSONObject) {
  workout.author = context.userId!
  context.ui.showToast("Submitting your post - upon completion you'll navigate there.");
  const subredditName = (await context.reddit.getCurrentSubreddit()).name
  const post = await context.reddit.submitPost({
    title: title,
    subredditName: subredditName,
    preview: (
      <vstack>
        <text color="black white">Loading brand new post...</text>
      </vstack>
    ),
  });
  await context.redis.set(keyForPost(post.id), JSON.stringify(workout));
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

function showSupersets(context: Devvit.Context, data: {}, exerciseIndex: number) {
  return exerciseIndex >= 0 && data.exercises.length > exerciseIndex + 1 && context.dimensions!.width > 400 && data.exercises[exerciseIndex].superset;
}

Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const increment = 2.5
    const [exerciseIndex, setExerciseIndex] = useState(0)
    const [repPicker, setRepPicker] = useState([-1])
    const [showMenu, setShowMenu] = useState(false)
    const [data, setData] = useState({})
    const [pendingUpdates, setPendingUpdates] = useState([]);
    const [editMode, setEditMode] = useState(false)
    const { error } = useAsync(async () => {
      if (pendingUpdates.length > 0) {
        const latestUpdate = pendingUpdates[pendingUpdates.length - 1];
        if (JSON.stringify(latestUpdate) == "{}" ) {
          await context.redis.del(keyForPostAndUser(context.postId!, context.userId!))
        } else {
          await context.redis.set(keyForPostAndUser(context.postId!, context.userId!), JSON.stringify(latestUpdate));
        }
        setPendingUpdates([]);
      }
    }, {
      depends: [pendingUpdates],
    });
    if (error) {
      console.error('Failed to save to Redis:', error);
    }

    const asyncResult = useAsync(async () => {
      var startedWorkout = await context.redis.get(keyForPostAndUser(context.postId!, context.userId!)) // User started a workout already
      if (startedWorkout == undefined) {
        return makeWorkoutFromTemplat(JSON.parse(await context.redis.get(keyForPost(context.postId!)))) // Load the workout template
      } else {
        return JSON.parse(startedWorkout);
      }
    }, {
      depends: [context.postId, context.userId],
      finally: (loadedData, error) => {
        if (loadedData) {
          setData(loadedData)
        }
      }
    });
    if (asyncResult.loading) {

      return <text>Loading from Redis...</text>;
    }
    if (asyncResult.error) {
      return <text>Error: {asyncResult.error.message}</text>;
    }
    const postForm = useForm(
      {
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Workout Title',
            required: true,
          },
          {
            type: 'string',
            name: 'exercise',
            label: 'First Exercise Name',
            // required: false,
            required: true,
          },
          {
            type: 'image',
            name: 'image',
            label: 'First Exercise Image',
            // required: false,
            required: true,
          },
          {
            type: 'number',
            name: 'sets',
            label: 'Number of Sets',
            // required: false,
            required: true,
          },
          {
            type: 'string',
            name: 'reps',
            label: 'Reps per set (or comma-separated list of reps)',
            required: true,
          },
          {
            type: 'string',
            name: 'weight',
            label: 'Weight per set (or comma-separated list of weights',
            // required: false,
            required: true,
          },
         ],
         title: 'Create a New Workout',
         acceptLabel: 'Post',
      }, async (values) => {
      const { title, exercise, image, sets, reps, weight } = values
      const response = await context.media.upload({
        url: image,
        type: 'image',
      })
      //TODO add image url to data somehow
      const newWorkout = {
        exercises: [
          {
            name: exercise,
            image: image,
            sets: Array(sets).fill({ reps: 0, target: Number(reps), weight: Number(weight) })
          }
        ]
      }
      await makeWorkitPost(context, title, newWorkout)
    }
    );
    const onRepsClick = (exerciseIndex: number) => (setIndex: number) => {
      setRepPicker([exerciseIndex, setIndex])
    }
    const setRepsForIndices = (indices: number[]) => (reps: number) => {
      const newData = JSON.parse(JSON.stringify(data))
      newData.exercises[indices[0]].sets[indices[1]].reps = reps
      setData(newData)
      setRepPicker([])
      setPendingUpdates(prev => [...prev, newData]);

    };
    const increaseWeightForIndices = (exerciseIndex: number) => (setIndex: number) => {
      const newData = JSON.parse(JSON.stringify(data))
      const newWeight = newData.exercises[exerciseIndex].sets[setIndex].weight + increment
      newData.exercises[exerciseIndex].sets[setIndex].weight = newWeight
      setIndex++
      while (setIndex < newData.exercises[exerciseIndex].sets.length) {
        if (!newData.exercises[exerciseIndex].sets[setIndex].reps) {
          newData.exercises[exerciseIndex].sets[setIndex].weight = newWeight
        }
        setIndex++
      }
      setData(newData)
      setPendingUpdates(prev => [...prev, newData]);
    }
    const decreaseWeightForIndices = (exerciseIndex: number) => (setIndex: number) => {
      const newData = JSON.parse(JSON.stringify(data))
      const newWeight = newData.exercises[exerciseIndex].sets[setIndex].weight - increment
      newData.exercises[exerciseIndex].sets[setIndex].weight = newWeight
      setIndex++
      while (setIndex < newData.exercises[exerciseIndex].sets.length) {
        if (!newData.exercises[exerciseIndex].sets[setIndex].reps) {
          newData.exercises[exerciseIndex].sets[setIndex].weight = newWeight
        }
        setIndex++
      }
      setData(newData)
      setPendingUpdates(prev => [...prev, newData]);
    }
    const resetWorkout = () => {
      setData({})
      setPendingUpdates(prev => [...prev, {}]);
    }
    const completeWorkout = () => {
      const newData = JSON.parse(JSON.stringify(data))
      newData.complete = true
      setData(newData)
      setPendingUpdates(prev => [...prev, newData]);
      context.reddit.submitComment({id: context.postId!, text: formatDataAsComment(data) })
    }

    return (
      <zstack height="100%" width="100%" alignment="start top">
        <vstack height="100%" width="100%" alignment="center middle" gap="small">
          {exerciseIndex > 0 ? <icon name="caret-up" onPress={() => setExerciseIndex(exerciseIndex - (showSupersets(context, data, exerciseIndex-2) ? 2 : 1))}/> : <spacer size="medium"/>}
          <hstack width="100%" alignment="center middle">
            <Exercise
              name={data.exercises[exerciseIndex].name}
              image={data.exercises[exerciseIndex].image ?? data.exercises[exerciseIndex].name.toLowerCase().replaceAll(" ", "") + ".gif"}
              sets={data.exercises[exerciseIndex].sets}
              onRepsClick={onRepsClick(exerciseIndex)}
              increaseWeightForIndex={increaseWeightForIndices(exerciseIndex)}
              decreaseWeightForIndex={decreaseWeightForIndices(exerciseIndex)}/> 
            {showSupersets(context, data, exerciseIndex) ?
            <hstack alignment="center middle">
              <spacer size="small" />
              <Exercise
              name={data.exercises[exerciseIndex+1].name}
              image={data.exercises[exerciseIndex+1].image ?? data.exercises[exerciseIndex+1].name.toLowerCase().replaceAll(" ", "") + ".gif"}
              sets={data.exercises[exerciseIndex+1].sets}
              onRepsClick={onRepsClick(exerciseIndex+1)}
              increaseWeightForIndex={increaseWeightForIndices(exerciseIndex+1)}
              decreaseWeightForIndex={decreaseWeightForIndices(exerciseIndex+1)}/> 
            </hstack>
            : <hstack/>}
          </hstack>
          {exerciseIndex + ((showSupersets(context, data, exerciseIndex) ? 2 : 1)) < data.exercises.length ? <icon size="medium" name="caret-down" onPress={() => setExerciseIndex(exerciseIndex + (showSupersets(context, data, exerciseIndex) ? 2 : 1))}/> : allSetsDone(data) && !data.complete ? <button icon="checkmark-fill" onPress={completeWorkout}>Complete</button> : <spacer size="medium"/>}
        </vstack>
        {repPicker.length > 1 ? <RepPicker maxWidth={context.dimensions!.width} setReps={setRepsForIndices(repPicker)} closePicker={() => setRepPicker([])}></RepPicker> : <vstack />}
        {showMenu ?
        <vstack width="100%" height="100%" onPress={() => setShowMenu(false)}></vstack> :
        <vstack/> }
        <vstack padding='small'>
          <button appearance="bordered" onPress={() => setShowMenu(!showMenu)} icon={showMenu ? "close" : "menu-fill"}></button>
          {showMenu ?
            <vstack darkBackgroundColor='rgb(26, 40, 45)' lightBackgroundColor='rgb(234, 237, 239)' cornerRadius='medium'>
              <hstack padding="small" onPress={() => context.ui.showForm(postForm)}><spacer/><icon lightColor='black' darkColor='white' name="add" /><spacer/><text lightColor='black' darkColor='white' weight="bold">New</text><spacer/></hstack>
              <hstack padding="small" onPress={() => console.log("not yet implemented")}><spacer/><icon lightColor='black' darkColor='white' name="settings" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Settings</text><spacer/></hstack>
              <hstack padding="small" onPress={resetWorkout}><spacer/><icon lightColor='black' darkColor='white' name="delete" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Reset Workout</text><spacer/></hstack>
              {data.author == context.userId! ?
              <hstack padding="small" onPress={() => setEditMode(true)}><spacer/><icon lightColor='black' darkColor='white' name="edit" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Edit</text><spacer/></hstack>
              :<vstack/>}
            </vstack>
           : <vstack/> }
        </vstack>
      </zstack>
    );
  },
});

export default Devvit;

