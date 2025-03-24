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
    }),
  info: `1. Stand with your heels at shoulder width, and the bar on your back.
2. Inhale and brace your core.
3. Bend your legs until hips are below the tops of your knees.
4. Straighten legs.`
};
const bench: ExerciseData = {
  name: "Bench Press",
  image: "benchpress.gif",
  sets: Array(5).fill(
    {
      target: 5,
      weight: 45
    }),
  info: `1. Lay on a bench with your face beneath the bar.
2. Push bar off of rack and straighten arms.
3. Lower bar until it touches your chest.
4. Straighten arms again.`
};
const row: ExerciseData = {
  name: "Barbell Row",
  image: "barbellrow.gif",
  sets: Array(5).fill(
    {
      target: 5,
      weight: 65
    }),
    info: `1. With feet beneath the bar, bend over and hold the bar.
2. Bend your knees slightly so that your back is parallel to the floor.
3. Keep your back straight and lift your chest. 
4. Pull the bar up to your sternum.
5. Lower the bar to the floor.`
  };
const overheadpress: ExerciseData = {
  name: "Overhead Press",
  image: "overheadpress.gif",
  sets: Array(5).fill(
    {
      target: 5,
      weight: 45
    }),
    info: `1. Hold the bar on the front of your shoulders, forearms vertical.
2. Push bar up until your elbows lock and shoulders shrug upward.
3. Lower bar back to shoulders.`
  };
const deadlift: ExerciseData = {
  name: "Deadlift",
  image: "deadlift.gif",
  sets: Array(1).fill(
    {
      target: 5,
      weight: 135
    }),
    info: `1. Stand with your feed under the bar.
2. Bend over and grab the bar with a shoulder-width grip.
3. Bend your knees until your shins touch the bar.
4. Lift your chest up and straighten your lower back.
5. Take a breath, hold it, and stand up.`
  };
const pullup: ExerciseData = {
  name: "Pullup",
  image: "pullup.gif",
  sets: Array(3).fill(
    {
      target: 8
    })
}
const kneeraise: ExerciseData = {
  name: "Knee Raise",
  image: "kneeraise.gif",
  sets: Array(3).fill(
    {
      target: 8
    })
}
const skullcrusher: ExerciseData = {
  name: "Skullcrusher",
  image: "skullcrusher.gif",
  sets: Array(3).fill(
    {
      target: 8,
      weight: 45
    })
}
const romaniandeadlift: ExerciseData = {
  name: "Romanian Deadlift",
  image: "romaniandeadlift.gif",
  sets: Array(3).fill(
    {
      target: 8,
      weight: 45
    })
}
const barbellcurl = {
  name: "Barbell Curl",
  image: "barbellcurl.gif",
  sets: Array(3).fill(
    {
      target: 8,
      weight: 45
    })
}
const dip = {
  name: "Dip",
  image: "dip.gif",
  sets: Array(3).fill(
    {
      target: 8
    })
}
const plank: ExerciseData = {
  name: "Plank",
  image: "plank.gif",
  sets: Array(3).fill(
    {
      targetTime: 30000
    })
}
const hipthrust: ExerciseData = {
  name: "Hip Thrust",
  image: "hipthrust.gif",
  sets: Array(3).fill(
    {
      target: 8,
      weight: 45
    })
}
export const strongLiftsA = {
  title: "Strong Lifts A",
  exercises: [
    squat,
    bench,
    row,
  ],
  optionalExercises: [
    pullup,
    kneeraise,
    skullcrusher,
    romaniandeadlift
  ]
};
export const strongLiftsB = {
  title: "Strong Lifts B",
  exercises: [
    squat,
    overheadpress,
    deadlift,
  ],
  optionalExercises: [
    barbellcurl,
    plank,
    dip,
    hipthrust
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
      name: "Plank Crunch",
      image: "plankcrunch.gif",
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
    {...JSON.parse(JSON.stringify(hipthrust)), superset: true},
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
  ],
  optionalExercises: []
};

Devvit.addMenuItem({
  label: 'New Strong Lifts A',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
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