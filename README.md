# Workit

Workit lets you write, share, and track workouts in Reddit. Posts allow each user to enter their own reps, weights, and/or times, and then share their results in a comment when they finish.

Workit reduces decisions about which exercise to do. It helps make a workout smoother by recording what you did with only a few clicks, and suggesting weights and reps using information from authors plus your exercise history. But Workit does not provide expertise on exactly how to do an exercise or whether it's a good fit for an individual, so users are heavilly encouraged to seek input from experts, which could happen elsewhere on Reddit, in person, or through research.

## TL;DR Demo Video

[https://youtu.be/LofNNB2jv4c](https://youtu.be/LofNNB2jv4c)

## Example subreddits:
[https://www.reddit.com/r/workit5x5/](https://www.reddit.com/r/workit5x5/)

[https://www.reddit.com/r/StretchIt/](https://www.reddit.com/r/StretchIt/)

[https://www.reddit.com/r/workit5x5/](https://www.reddit.com/r/workit5x5/)


## To Do a Workout
- Find an existing Workit post, such as [Strong Lifts B (March 28, 2025)](https://www.reddit.com/r/workit5x5/comments/1jm0f9q/strong_lifts_b_march_28_2025/)
- Click the blue buttons to progress through the exercises, until you have clicked Complete
- You can jump around and enter or change reps and weights of any set at any time. Buttons let you move between adjacent exercises, and a progress bar on the left can skip to any part of a workout.
- If you change weights of a set, all of the following incomplete sets of that exercise automatically take on the new weight.
- Click on a weight to see a Plate Calculator for loading a barbell. This calculator will also suggest plates for warmup sets.
- The menu in the top left allows you to reset your progress, or change personal settings like your weight increment and barbell weight.
- At the bottom of some workouts, a Plus button lets you add optional additional exercises, like accessory lifts to support the routine if you have time and interest.
- After completing a workout, the You Did It button shows some motivating stats and info.
- You may get messages when new workouts show up after you recently completed a workout in the same subreddit. There is a setting to disable these messages.
- Weights are automatically set based on your most recent completion of the same exercise. Weight is increased by your increment if you hit all of the target reps previously, and otherwise it is kept at the previous weight.
- Once you enter reps for a set, timers in the upper-right will keep track of the total workout time, and the time since you last entered reps for a set.
- Between workouts, check out Achievements, Progress, and your Logbook (linked in the pinned post, in completed workouts, and in the menu), and use the comments of Workit posts to discuss with other people!

Note: Each Redditor sees their own personal progress, sets, and weights for a workout separately. Your changes appear within the app, but do not affect the post that other users will see. The only shared information with other users is when you Complete the workout, which submits a comment below the post detailing what you did.

## To Author Workouts

A variety of tools allow authoring and editting of workouts manually or automatically. A Workit workout is a collection of exercises intended to be done together within one session, and those exercises are composed of sets, where each set involves reps (repetitions) of the same movement at a certain weight. 

- Mods of a sub have buttons in the subreddit menu to create example workouts.
- When viewing an existing workout, open the menu in the top left and click New Exercise to open a form for authoring an exercise. You must name the exercise, provide an image (preferably an animated gif), and then indicate the number of sets and reps per set, plus an initial weight if appropriate.
- Once you have defined the exercises you will use, open the menu in the top left and click New Workout for a form that authors a new workout. You workout needs a name, plus a collection of existing exercises which you will pick from drop-downs. Some basic exercises are available already.
- After creating a workout, the menu allows the author to enter Edit Mode, where you can change and add exercises in the workout. Like the original workout, these changes will be available to everyone who starts your workout.

## Daily Workouts

Workit settings allow automatic daily creation of workouts. As a moderator, you need to fill in:
- "First Daily Workout to automatically post." Choose the workout you want to show up first.
- Any number of additional daily workouts you want on subsequent days. If you want to skip a day in the rotation for rest, choose "Rest Day"
- If your rotation is less than 8 days, choose None or leave blank the other Daily Workout fields
- To start the daily posts as soon as possible, set "Milliseconds since epoch for first Daily Workout to post" to the number you get from running `Date.now()` in a javascript console.

In its current form, the initial configuration of daily workouts is indended to be done in partnership with a Workit developer. Please reach out to u/Sqerp for help!

## Changelog:
2025-03-08
- Submit v0 for publish
2025-03-28
- Final version for hackathon
