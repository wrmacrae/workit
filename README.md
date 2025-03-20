## Workit

Workit lets you write, share, and track workouts in Reddit. Posts allow each user to enter their own reps and weights, and then share their results in a comment when they finish. A variety of tools allow authoring and editting of workouts manually or automatically (on a daily basis). A Workit workout is a collection of exercises intended to be done together within one session, and those exercises are composed of sets, where each set involves reps (repetitions) of the same movement at a certain weight.

#### To Do a Workout
- Find an existing Workit post (such as [Strong Lifts B](https://www.reddit.com/r/workit5x5/comments/1jevba7/strong_lifts_b/))
- Click the blue buttons to progress through the exercises, until you have clicked Complete
- You can jump around and enter or change reps and weights of any set at any time.
- If you change weights of a set, all of the following incomplete sets of that exercise automatically take on the new weight.
- Click on a weight to see a Plate Calculator for loading a barbell. This calculator will also suggest plates for warmup sets.
- The menu in the top left allows you to reset your progress, or change personal settings like your weight increment and barbell weight.
- At the bottom of some workouts, a Plus button lets you add optional additional exercises, like accessory lifts to support the routine if you have time and interest.
- After completing a workout, the You Did It button shows some motivating stats and info.
- You will get messages when new workouts show up after you recently completed a workout in the same subreddit. There is a setting to disable these.
- Weights are automatically set based on your most recently completion of the same exercise. You will get the same weight plus your increment if you hit all of the target reps, and otherwise you will get the previous weight.
- Once you enter reps for a set, timers in the upper-right will keep track of the total workout time, and the time since you last entered reps for a set.

Note: Each Redditor sees their own personal progress, sets, and weights for a workout separately. Your changes appear within the app, but do not affect the post that other users will see. The only shared information with other users is when you Complete the workout, which submits a comment below the post detailing what you did.

#### To Author Workouts
- Mods of a sub have buttons in the subreddit menu to create some example workouts
- When viewing an existing workout, the menu in the top left allows you to fill in a form to create a New Exercise. You must name the exercise, provide an image (preferably an animated gif), and then indice the number of sets and reps per set.
- Once you have defined the exercises you will use, the menu in the top left allows you to fill in a different form to create a New Workout, which needs a name, plus a collection of existing exercises which you will pick from drop-downs. Some basic exercises are available already.
- After creating a workout, the menu allows the author to enter Edit Mode, where you can change and add exercises in the workout. Like the original workout, these changes will be available to everyone who starts your workout.

#### Daily Workouts

Workit settings allow automatic daily creation of workouts. As a moderator, you need to fill in:
- A JSON list represending the rotation of exercises
- The milliseconds since epoch for the first day the rotation should start

In its current form, the initial configuration of daily workouts is indended to be done in partnership with a Workit developer. Please reach out to u/Sqerp for help!

#### Changelog:
2025-03-08
- Submit v0 for publish

Example post:
https://www.reddit.com/r/workit5x5/comments/1j5lvh3/strong_lifts_a/
