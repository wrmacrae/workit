// Learn more at developers.reddit.com/docs
import { Devvit, useAsync, useState } from '@devvit/public-api';
import { RepPicker } from './components/reppicker.js';
import { Exercise } from './components/exercise.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
  media: true,
});

const muscles = ["Legs", "Abs", "Shoulders", "Forearms", "Back", "Triceps", "Chest", "Biceps"]

const muscleToExercises: Record<string, string[]> = {
  "Legs": ["Weighted Lunge", "Squat", "Hip Thrust", "Donkey Kick", "Calf Raise"],
  "Abs": ["Spiderman Plank Crunch", "Leg Lift", "Jackknife", "Bicycle"]
}

function key(postId: string, userId: string) {
  return `post-{postId}-user-{userId}`
}

const strongLifts = {
  muscles: ["Squat", "Bench Press", "Barbell Row"],
  "Squat": {
    exercises: ["Squat"],
    "Squat":
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
  "Bench Press": {
    exercises: ["Bench Press"],
    "Bench Press":
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
    "Barbell Row": {
      exercises: ["Barbell Row"],
        "Barbell Row":
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
}

const initialData = {
  muscles: ["Legs", "Abs"],
  "Legs": {
    exercises: ["Weighted Lunge", "Squat", "Hip Thrust", "Calf Raise"],
    "Weighted Lunge":
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
      "Squat":
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
      "Hip Thrust":
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
      "Calf Raise":
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
  "Abs": {
    exercises: ["Spiderman Plank Crunch", "Leg Lift", "Jackknife Crunch", "Bicycle"],
    "Spiderman Plank Crunch":
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
      "Leg Lift":
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
      "Jackknife Crunch":
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
      "Bicycle":
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
  }
}

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'My devvit post',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Experience Post',
  height: 'tall',
  render: (context) => {
    const increment = 2.5
    const [muscles, setMuscles] = useState(strongLifts.muscles);
    const [muscleIndex, setMuscleIndex] = useState(0)
    const [exerciseIndex, setExerciseIndex] = useState(0)
    const [repPicker, setRepPicker] = useState([-1])
    const [data, setData] = useState(strongLifts)
    const asyncResult = useAsync(async () => {
      return await context.redis.get(key(context.postId!, context.userId!));
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
      return <text>Loading...</text>;
    }
    if (asyncResult.error) {
      return <text>Error: {asyncResult.error.message}</text>;
    }
    const onRepsClick = (muscleIndex: number, exerciseIndex: number) => (setIndex: number) => {
      setRepPicker([muscleIndex, exerciseIndex, setIndex])
    }
    const setRepsForIndices = (indices: number[]) => (reps: number) => {
      const muscle = data.muscles[indices[0]]
      const exercise = data[muscle].exercises[indices[1]]
      data[muscle][exercise][indices[2]].reps = reps
      setData(data)
      setRepPicker([])
      context.redis.set(key(context.postId!, context.userId!), JSON.stringify(data))
    }
    const increaseWeightForIndices = (muscleIndex: number, exerciseIndex: number) => async (setIndex: number) => {
      const muscle = data.muscles[muscleIndex]
      const exercise = data[muscle].exercises[exerciseIndex]
      data[muscle][exercise][setIndex].weight += increment
      setData(data)
      context.redis.set(key(context.postId!, context.userId!), JSON.stringify(data))
    }
    const decreaseWeightForIndices = (muscleIndex: number, exerciseIndex: number) => (setIndex: number) => {
      const muscle = data.muscles[muscleIndex]
      const exercise = data[muscle].exercises[exerciseIndex]
      data[muscle][exercise][setIndex].weight -= increment
      setData(data)
      context.redis.set(key(context.postId!, context.userId!), JSON.stringify(data))
    }

    return (
      <zstack height="100%" width="100%" alignment="center middle">
        <vstack gap="small" alignment="center middle">
          {exerciseIndex > 0 ? <icon name="caret-up" onPress={() => setExerciseIndex(exerciseIndex - 1)}/> : <spacer size="medium"/>}
          <hstack height="100%" width="100%" alignment="center middle">
            {muscleIndex > 0 ? <icon name="caret-left" onPress={() => setMuscleIndex(muscleIndex - 1)}/> : <spacer size="medium"/>}
            <Exercise
              muscle={muscles[muscleIndex]}
              name={data[muscles[muscleIndex]]["exercises"][exerciseIndex]}
              image={data[muscles[muscleIndex]]["exercises"][exerciseIndex].toLowerCase().replaceAll(" ", "") + ".gif"}
              sets={data[muscles[muscleIndex]][data[muscles[muscleIndex]]["exercises"][exerciseIndex]]}
              onRepsClick={onRepsClick(muscleIndex, exerciseIndex)}
              increaseWeightForIndex={increaseWeightForIndices(muscleIndex, exerciseIndex)}
              decreaseWeightForIndex={decreaseWeightForIndices(muscleIndex, exerciseIndex)}/> 
            {context.dimensions!.width > 400 ?
            <hstack alignment="center middle">
              <spacer size="small" />
              <Exercise
                muscle={muscles[muscleIndex+1]}
                name={data[muscles[muscleIndex+1]]["exercises"][exerciseIndex]}
                image={data[muscles[muscleIndex+1]]["exercises"][exerciseIndex].toLowerCase().replaceAll(" ", "") + ".gif"}
                sets={data[muscles[muscleIndex+1]][data[muscles[muscleIndex+1]]["exercises"][exerciseIndex]]}
                onRepsClick={onRepsClick(muscleIndex+1, exerciseIndex)}
                increaseWeightForIndex={increaseWeightForIndices(muscleIndex+1, exerciseIndex)}
                decreaseWeightForIndex={decreaseWeightForIndices(muscleIndex+1, exerciseIndex)}/> 
              {muscleIndex + 2 < muscles.length ? <icon name="caret-right" onPress={() => setMuscleIndex(muscleIndex + 1)}/> : <spacer size="medium"/>}
            </hstack>
            : muscleIndex + 1 < muscles.length ? <icon name="caret-right" onPress={() => setMuscleIndex(muscleIndex + 1)}/> : <spacer size="medium"/>}
          </hstack>
          {exerciseIndex + 1 < data[muscles[muscleIndex]]["exercises"].length ? <icon name="caret-down" onPress={() => setExerciseIndex(exerciseIndex + 1)}/> : <spacer size="medium"/>}
        </vstack>
        {repPicker.length > 2 ? <RepPicker maxWidth={context.dimensions!.width} setReps={setRepsForIndices(repPicker)} closePicker={() => setRepPicker([])}></RepPicker> : <vstack />}
      </zstack>
    );
  },
});

export default Devvit;
