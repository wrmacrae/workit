import { Devvit } from "@devvit/public-api";
import { ExerciseData } from "./types.js";
import { makeWorkitPost } from "./main.js";

export const squat: ExerciseData = {
  name: "Squat",
  image: "squat.gif",
  sets: Array(5).fill(
    {
      target: 5,
      weight: 45
    })
};
const bench: ExerciseData = {
  name: "Bench Press",
  image: "benchpress.gif",
  sets: Array(5).fill(
    {
      target: 5,
      weight: 45
    })
};
const row: ExerciseData = {
  name: "Barbell Row",
  image: "barbellrow.gif",
  sets: Array(5).fill(
    {
      target: 5,
      weight: 45
    })
};
const overheadpress: ExerciseData = {
  name: "Overhead Press",
  image: "overheadpress.gif",
  sets: Array(5).fill(
    {
      target: 5,
      weight: 45
    })
}
const deadlift: ExerciseData = {
  name: "Deadlift",
  image: "deadlift.gif",
  sets: Array(1).fill(
    {
      target: 5,
      weight: 45
    })
}
export const strongLiftsA = {
  title: "Strong Lifts A",
  exercises: [
    squat,
    bench,
    row,
  ]
};
export const strongLiftsB = {
  title: "Strong Lifts B",
  exercises: [
    squat,
    overheadpress,
    deadlift,
  ]
};
export const supersetsWorkout = {
  title: "Superset Workout",
  exercises: [
    {
      name: "Weighted Lunge",
      image: "weightedlunge.gif",
      superset: true,
      sets: [
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
      sets: Array(3).fill(
        {
          target: 15,
        })
    },
    {
      name: "Squat 3x10",
      image: "squat.gif",
      superset: true,
      sets: [
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
      sets: Array(3).fill(
        {
          target: 15,
        })
    },
    {
      name: "Hip Thrust",
      image: "hipthrust.gif",
      superset: true,
      sets: [
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
      sets: Array(3).fill(
        {
          target: 15,
        })
    }, {
      name: "Calf Raise",
      image: "calfraise.gif",
      superset: true,
      sets: [
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
      sets: Array(3).fill(
        {
          target: 15,
        })
    },
  ]
};

Devvit.addMenuItem({
  label: 'New Strong Lifts A',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    console.log(JSON.stringify(strongLiftsA))
    const post = await makeWorkitPost(context, strongLiftsA)
  },
});

Devvit.addMenuItem({
  label: 'New Strong Lifts B',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    console.log(JSON.stringify(strongLiftsB))
    const post = await makeWorkitPost(context, strongLiftsB)
  },
});

Devvit.addMenuItem({
  label: 'New Supersets Workout',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await makeWorkitPost(context, supersetsWorkout)
  },
});