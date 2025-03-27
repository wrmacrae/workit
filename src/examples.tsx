import { Devvit } from "@devvit/public-api";
import { ExerciseData, loadingWorkout, WorkoutData } from "./types.js";
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
const shoulderExtension: ExerciseData = {
  name: "Shoulder Extension",
  image: "shoulderextension.gif",
  sets: [{targetTime: 60000}],
  superset: true,
  info: `Place your hands on some object overhead, while keeping your arms straight.
You may bend forward to an object, as long as it is still "overhead".
Attempt to push your head and chest through so that the arms are pressed behind the body.`
}
const underarmShoulderStretch: ExerciseData = {
  name: "Underarm Shoulder Stretch",
  image: "underarmshoulderstretch.jpg",
  sets: [{targetTime: 60000}],
  info: `While seated, place your hands behind you on the ground, fingers pointing away, and slide your butt forward, keeping the arms straight.
This can also be done by placing your hands behind you on a tall object, and squatting/crouching down.`
}
const rearHandClaspLeft: ExerciseData = {
  name: "Rear Hand Clasp Left",
  image: "rearhandclaspleft.jpg",
  sets: [{targetTime: 60000}],
  superset: true,
  info: `With your left hand overhead and your right hand behind your lower back, attempt to grasp fingertips behind your back.`
}
const rearHandClaspRight: ExerciseData = {
  name: "Rear Hand Clasp Right",
  image: "rearhandclaspright.jpg",
  sets: [{targetTime: 60000}],
  info: `With your right hand overhead and your left hand behind your lower back, attempt to grasp fingertips behind your back.`
}
const fullSquat: ExerciseData = {
  name: "Full Squat",
  image: "fullsquat.png",
  sets: [{targetTime: 60000}],
  superset: true,
  info: `Keeping your heels on the ground, squat down as far as your body will allow.
Keep your arms inside the knees and press them outward.
Feel free to hold on to something for balance, as it should not affect the stretch, but free balancing is preferred.`
}
const standingPike: ExerciseData = {
  name: "Standing Pike",
  image: "standingpike.jpg",
  sets: [{targetTime: 60000}],
  info: `Bend forward, hinging at the hips while trying to keep the back flat.
Do not try to touch your toes - instead, try to touch the ground 1-2 feet in front of your toes.
This will help you hinge at the hips and not bend at the back.
When you can get decewntly below parallel with a flat back, then you can grab your calves and attempt to pull your head to your knees.`
}
const kneelinglungeleft: ExerciseData = {
  name: "Kneeling Lunge Left",
  image: "kneelinglungeleft.gif",
  sets: [{targetTime: 60000}],
  superset: true,
  info: `Kneel on the ground, and place your left foot in front of you, flat on the ground, in a lunge position with the right knee and top of your right foot on the ground.
Squeeze the glutes and press the pelvis forward, stretching your right leg.
Move the left foot forward as needed to ensure the left shin remains roughtly vertical, and not bending backward or leaning forwards.`
}
const kneelinglungeright: ExerciseData = {
  name: "Kneeling Lunge Right",
  image: "kneelinglungeright.gif",
  sets: [{targetTime: 60000}],
  info: `Kneel on the ground, and place your right foot in front of you, flat on the ground, in a lunge position with the left knee and top of your left foot on the ground.
Squeeze the glutes and press the pelvis forward, stretching your left leg.
Move the right foot forward as needed to ensure the right shin remains roughtly vertical, and not bending backward or leaning forwards.`
}
const butterfly: ExerciseData = {
  name: "Butterfly",
  image: "butterfly.jpg",
  sets: [{targetTime: 60000}],
  superset: true,
  info: `Sit on the ground, and bring the bottoms of your feet together in front of you.
Hold your feet together with your hands and pull them slightly towards you.
Place your elbows against the inside of your thighs and carefully push the thighs downward.
Keep the back flat and your head aligned with your spine.
This should create a stretch through your inner thighs.`
}
const backbend: ExerciseData = {
  name: "Backbend",
  image: "backbend.jpg",
  sets: [{targetTime: 60000}],
  info: `While lying on your back, bend your kneeds and put your feet near your buttocks.
By squeezing the glutes, lift the hips and pelvis off the floor and press it toward the ceiling`
}
const lyingTwistLeft: ExerciseData = {
  name: "Lying Twist Left",
  image: "lyingtwistleft.jpg",
  sets: [{targetTime: 60000}],
  superset: true,
  info: `Lie on the ground, facing upward, and extend your arms out to the sides.
Lift your left leg up at a 90 degree angle (bend the knee as much as necessary).
Now lower your left leg to the right side of your torso while keeping your shoulders on the ground.
Attempt to touch the ground with the left leg while maintaining shoulders on the floor.
Turn your head to the left.`
}
const lyingTwistRight: ExerciseData = {
  name: "Lying Twist Right",
  image: "lyingtwistright.jpg",
  sets: [{targetTime: 60000}],
  info: `Lie on the ground, facing upward, and extend your arms out to the sides.
Lift your right leg up at a 90 degree angle (bend the knee as much as necessary).
Now lower your right leg to the right side of your torso while keeping your shoulders on the ground.
Attempt to touch the ground with the right leg while maintaining shoulders on the floor.
Turn your head to the right.`
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
export const startingStretching = {
  title: "Starting Stretching",
  exercises: [
    shoulderExtension,
    underarmShoulderStretch,
    rearHandClaspLeft,
    rearHandClaspRight,
    fullSquat,
    standingPike,
    kneelinglungeleft,
    kneelinglungeright,
    butterfly,
    backbend,
    lyingTwistLeft,
    lyingTwistRight
  ]
}
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
  label: 'New Starting Stretching',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await makeWorkitPost(context, startingStretching)
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

var pinned = JSON.parse(JSON.stringify(loadingWorkout))
pinned.title = "Work Out in Reddit!"

Devvit.addMenuItem({
  label: 'New Pinnable Summary',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    const post = await makeWorkitPost(context, pinned)
  },
});
