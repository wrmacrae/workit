// Learn more at developers.reddit.com/docs
import { Devvit, JSONObject, RedditAPIClient, RedisClient, useAsync, useForm, useState } from '@devvit/public-api';
import { RepPicker } from './components/reppicker.js';
import { Exercise } from './components/exercise.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

const muscles = ["Legs", "Abs", "Shoulders", "Forearms", "Back", "Triceps", "Chest", "Biceps"]
// const muscleOptions = muscles.map((muscle: string) => { label: muscle, value: muscle })
// const exercisesOptions = Array(5).map((_, i) => { label: i+1, value: i+1 }})

const muscleToExercises: Record<string, string[]> = {
  "Legs": ["Weighted Lunge", "Squat", "Hip Thrust", "Donkey Kick", "Calf Raise"],
  "Abs": ["Spiderman Plank Crunch", "Leg Lift", "Jackknife", "Bicycle"]
}

function keyForPostAndUser(postId: string, userId: string) {
  return `post-${postId}-user-${userId}`
}

function keyForPost(postId: string) {
  return `post-${postId}`
}

const strongLifts = {
  complete: false,
  muscles: ["Squat", "Bench Press", "Barbell Row"],
  "Squat": {
    exercises: ["Squat"],
    "Squat": {
      sets:
      [
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
      ],
    },
  },
  "Bench Press": {
    exercises: ["Bench Press"],
    "Bench Press": {
      sets:
      [
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
      ],
      },
  },
  "Barbell Row": {
    exercises: ["Barbell Row"],
    "Barbell Row": {
      sets:
      [
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
      ],
    },
  },
}

const initialData = {
  complete: false,
  muscles: ["Legs", "Abs"],
  "Legs": {
    exercises: ["Weighted Lunge", "Squat", "Hip Thrust", "Calf Raise"],
    "Weighted Lunge": {
      sets:
      [
        {
          reps: 0,
          target: 15,
          weight: 15
        },
        {
          reps: 0,
          target: 12,
          weight: 15
        },
        {
          reps: 0,
          target: 10,
          weight: 15
        },
      ],
    },
    "Squat": {
      sets:
      [
        {
          reps: 0,
          target: 15,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 10,
          weight: 45
        },
      ],
    },
    "Hip Thrust": {
      sets:
      [
        {
          reps: 0,
          target: 15,
          weight: 45
        },
        {
          reps: 0,
          target: 5,
          weight: 45
        },
        {
          reps: 0,
          target: 10,
          weight: 45
        },
      ],
    },
    "Calf Raise": {
      sets:
      [
        {
          reps: 0,
          target: 15,
          weight: 20
        },
        {
          reps: 0,
          target: 12,
          weight: 20
        },
        {
          reps: 0,
          target: 10,
          weight: 20
        },
      ],
    },
  },
  "Abs": {
    exercises: ["Spiderman Plank Crunch", "Leg Lift", "Jackknife Crunch", "Bicycle"],
    "Spiderman Plank Crunch": {
      sets:
      [
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 12,
        },
        {
          reps: 0,
          target: 10,
        },
      ],
    },
    "Leg Lift": {
      sets:
      [
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 12,
        },
        {
          reps: 0,
          target: 10,
        },
      ],
    },
    "Jackknife Crunch": {
      sets:
      [
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 12,
        },
        {
          reps: 0,
          target: 10,
        },
      ],
    },
    "Bicycle": {
      sets:
      [
        {
          reps: 0,
          target: 15,
        },
        {
          reps: 0,
          target: 12,
        },
        {
          reps: 0,
          target: 10,
        },
      ],
    },
  }
}

function allSetsDone(data) {
  for (const muscle of data.muscles) {
    for (const exercise of data[muscle].exercises) {
      if (!data[muscle][exercise].sets.every((set) => set.reps > 0)) {
        return false
      }
    }
  }
  return true
}

function formatDataAsComment(data) {
  var comment = ""
  for (const muscle of data.muscles) {
    comment += `**${muscle}**\n\n`
    for (const exercise of data[muscle].exercises) {
      comment += `${exercise}:\n\n`
      const setsAsStrings = data[muscle][exercise].sets.map((set) => `${set.reps} at ${set.weight}`)
      if (new Set(setsAsStrings).size == 1)
      {
        comment += `${data[muscle][exercise].sets.length}x${setsAsStrings[0]}`
      } else {
        comment += setsAsStrings.join(", ")
      }
    }
    comment += `\n\n`
  }
  return comment
}

async function makeWorkitPost(context: Devvit.Context, title: string, workout: JSONObject) {
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

Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const increment = 2.5
    const [muscles, setMuscles] = useState([]);
    const [muscleIndex, setMuscleIndex] = useState(0)
    const [exerciseIndex, setExerciseIndex] = useState(0)
    const [repPicker, setRepPicker] = useState([-1])
    const [showMenu, setShowMenu] = useState(false)
    const [data, setData] = useState({})
    const [pendingUpdates, setPendingUpdates] = useState([]);
    const { error } = useAsync(async () => {
      if (pendingUpdates.length > 0) {
        const latestUpdate = pendingUpdates[pendingUpdates.length - 1];
        await context.redis.set(keyForPostAndUser(context.postId!, context.userId!), JSON.stringify(latestUpdate));
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
        return await context.redis.get(keyForPost(context.postId!)) // Load the workout template
      } else {
        return startedWorkout;
      }
    }, {
      depends: [context.postId, context.userId],
      finally: (loadedData, error) => {
        if (loadedData) {
          const parsedData = JSON.parse(loadedData.toString())
          setData(parsedData)
          setMuscles(parsedData.muscles)
        }
      }
    });
    if (asyncResult.loading) {

      return <text>Loading from Redis...</text>;
    }
    if (asyncResult.error) {
      return <text>Error: {asyncResult.error.message}</text>;
    }
    // const musclesForm = useForm(
    //   {
    //     fields: [
    //       {
    //         type: 'select',
    //         name: 'first',
    //         label: 'First Muscle',
    //         required: true,
    //         options: muscleOptions,
    //       },
    //       {
    //         type: 'select',
    //         name: 'second',
    //         label: 'Second Muscle',
    //         required: true,
    //         options: muscleOptions,
    //       },
    //       {
    //         type: 'select',
    //         name: 'first',
    //         label: 'Third Muscle',
    //         required: true,
    //         options: muscleOptions,
    //       },
    //       {
    //         type: 'select',
    //         name: 'exercises',
    //         label: "Exercises per Muscle",
    //         required: true,
    //       }
    //     ]
    //   }
    // )
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
            name: 'muscle',
            label: 'First Muscle',
            // required: false,
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
            name: 'picture',
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
      const { title, muscle, exercise, picture, sets, reps, weight } = values
      const response = await context.media.upload({
        url: picture,
        type: 'image',
      })
      //TODO add picture url to data somehow
      var newWorkout = {
        complete: false,
        author: context.userId!,
        muscles: [muscle]
      }
      newWorkout[muscle] = {"exercises" : [exercise]}
      newWorkout[muscle][exercise] = {sets: Array(sets).fill({ reps: 0, target: Number(reps), weight: Number(weight) }), picture: response.mediaId}   
      await makeWorkitPost(context, title, newWorkout)
    }
    );
    const onRepsClick = (muscleIndex: number, exerciseIndex: number) => (setIndex: number) => {
      setRepPicker([muscleIndex, exerciseIndex, setIndex])
    }
    const setRepsForIndices = (indices: number[]) => (reps: number) => {
      const newData = JSON.parse(JSON.stringify(data))
      const muscle = newData.muscles[indices[0]]
      const exercise = newData[muscle].exercises[indices[1]]
      newData[muscle][exercise].sets[indices[2]].reps = reps
      setData(newData)
      setRepPicker([])
      setPendingUpdates(prev => [...prev, newData]);

    };
    const increaseWeightForIndices = (muscleIndex: number, exerciseIndex: number) => (setIndex: number) => {
      const newData = JSON.parse(JSON.stringify(data))
      const muscle = newData.muscles[muscleIndex]
      const exercise = newData[muscle].exercises[exerciseIndex]
      newData[muscle][exercise].sets[setIndex].weight += increment
      setData(newData)
      setPendingUpdates(prev => [...prev, newData]);
    }
    const decreaseWeightForIndices = (muscleIndex: number, exerciseIndex: number) => (setIndex: number) => {
      const newData = JSON.parse(JSON.stringify(data))
      const muscle = newData.muscles[muscleIndex]
      const exercise = newData[muscle].exercises[exerciseIndex]
      newData[muscle][exercise].sets[setIndex].weight -= increment
      setData(newData)
      setPendingUpdates(prev => [...prev, newData]);
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
        <vstack height="100%" width="100%" gap="small" alignment="center middle">
          {exerciseIndex > 0 ? <icon name="caret-up" onPress={() => setExerciseIndex(exerciseIndex - 1)}/> : <spacer size="medium"/>}
          <hstack height="100%" width="100%" alignment="center middle">
            {muscleIndex > 0 ? <icon name="caret-left" onPress={() => setMuscleIndex(muscleIndex - 1)}/> : <spacer size="medium"/>}
            <Exercise
              muscle={muscles[muscleIndex]}
              name={data[muscles[muscleIndex]]["exercises"][exerciseIndex]}
              image={data[muscles[muscleIndex]]["exercises"][exerciseIndex].toLowerCase().replaceAll(" ", "") + ".gif"}
              sets={data[muscles[muscleIndex]][data[muscles[muscleIndex]]["exercises"][exerciseIndex]].sets}
              onRepsClick={onRepsClick(muscleIndex, exerciseIndex)}
              increaseWeightForIndex={increaseWeightForIndices(muscleIndex, exerciseIndex)}
              decreaseWeightForIndex={decreaseWeightForIndices(muscleIndex, exerciseIndex)}/> 
            {context.dimensions!.width > 400 && muscleIndex + 1 < muscles.length ?
            <hstack alignment="center middle">
              <spacer size="small" />
              <Exercise
                muscle={muscles[muscleIndex+1]}
                name={data[muscles[muscleIndex+1]]["exercises"][exerciseIndex]}
                image={data[muscles[muscleIndex+1]]["exercises"][exerciseIndex].picture ?? data[muscles[muscleIndex+1]]["exercises"][exerciseIndex].toLowerCase().replaceAll(" ", "") + ".gif"}
                sets={data[muscles[muscleIndex+1]][data[muscles[muscleIndex+1]]["exercises"][exerciseIndex]].sets}
                onRepsClick={onRepsClick(muscleIndex+1, exerciseIndex)}
                increaseWeightForIndex={increaseWeightForIndices(muscleIndex+1, exerciseIndex)}
                decreaseWeightForIndex={decreaseWeightForIndices(muscleIndex+1, exerciseIndex)}/> 
              {muscleIndex + 2 < muscles.length ? <icon name="caret-right" onPress={() => setMuscleIndex(muscleIndex + 1)}/> : <spacer size="medium"/>}
            </hstack>
            : muscleIndex + 1 < muscles.length ? <icon name="caret-right" onPress={() => setMuscleIndex(muscleIndex + 1)}/> : <spacer size="medium"/>}
          </hstack>
          {exerciseIndex + 1 < data[muscles[muscleIndex]]["exercises"].length ? <icon name="caret-down" onPress={() => setExerciseIndex(exerciseIndex + 1)}/> : allSetsDone(data) && !data.complete ? <button icon="checkmark-fill" onPress={completeWorkout}>Complete</button> : <spacer size="medium"/>}
        </vstack>
        {repPicker.length > 2 ? <RepPicker maxWidth={context.dimensions!.width} setReps={setRepsForIndices(repPicker)} closePicker={() => setRepPicker([])}></RepPicker> : <vstack />}
        {showMenu ?
        <vstack width="100%" height="100%" onPress={() => setShowMenu(false)}></vstack> :
        <vstack/> }
        <vstack padding='small'>
          <button appearance="bordered" onPress={() => setShowMenu(!showMenu)} icon={showMenu ? "close" : "menu-fill"}></button>
          {showMenu ?
            <vstack darkBackgroundColor='rgb(26, 40, 45)' lightBackgroundColor='rgb(234, 237, 239)' cornerRadius='medium'>
              <hstack padding="small" onPress={() => context.ui.showForm(postForm)}><spacer/><icon lightColor='black' darkColor='white' name="add" /><spacer/><text lightColor='black' darkColor='white' weight="bold">New</text><spacer/></hstack>
              <hstack padding="small" onPress={() => console.log("not yet implemented")}><spacer/><icon lightColor='black' darkColor='white' name="settings" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Settings</text><spacer/></hstack>
              <hstack padding="small" onPress={() => console.log("not yet implemented")}><spacer/><icon lightColor='black' darkColor='white' name="delete" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Reset Workout</text><spacer/></hstack>
            </vstack>
           : <vstack/> }
        </vstack>
      </zstack>
    );
  },
});

export default Devvit;
