import { Devvit, StateSetter, useState } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"
import { setTimes, totalDuration } from "./timer.js"

interface CompletionProps {
    workout: WorkoutData
    showCompletion: boolean
    setShowCompletion: StateSetter<boolean>
}

const DID_YOU_KNOWS = [
    "Physical activity makes your brain work better!",
    "Not only does exercise burn calories, it creaates muscle that will passively burn calories every day!",
    "Exercise boosts your immune system, reducing the chance and severity of illness!",
    "Working out increases your lifespan!",
    "Endorphins from a workout can boost productivity and focus!",
    "Working out can make you happier, more relaxed, and less anxious!",
    "Your body sleeps better when you keep it active!",
    "Sweat clears out your pores, which is great for your skin!",
    "You can do most hobbies for years or decades longer by establishing healthy habits now!",
    "When you take care of your own health, it sets an example that improves the health of those around you!",
    "Regular exercise boosts confidence and self-esteem!",
    "Exercise usually costs little or no money, and results in savings on health expenditure!",
    "Physical activity makes you enjoy food more and helps you prefer healthier foods!",
]

const TIPS = [
    "Drink some water to help your body recover.",
    "Do some stretching to improve mobility.",
    "Tell someone what you did!",
    "Congratulate yourself. Be brave and say it out loud!",
    "Share how your workout went in the comments. Making health social helps you learn and stay consistent, and reflection is how you learn and improve.",
    "Alternate cardio and strength. If this workout had you winded, consider something slower paced next. If you're sweating right now, consider some slower-paced lifting next.",
    "Try to exercise every 2 or 3 days. You can do cardio more frequently, but your muscles do need time to recover and grow.",
    "Get some feedback! Do a form check on Reddit or have a friend spot you.",
    "Now's a great time to research an exercise or muscle you were thinking about.",
    "Treat yourself! Buy or do something, big or small, that makes you feel rewarded. Maybe gear that will help next time or a healthy snack?",
    "Sleep is a critical part of recovery. Make sure you're getting 7-9 hours of sleep, so that you get all the benefit of your hard work.",
    "Try asking a question in the comments!",
]

const STATS = [
    totalWeight,
    caloriesBurnt,
    activeTime,
    targetRepsReached,    
]

function totalWeight(workout: WorkoutData) {
    return `Total Weight Lifted: ${workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets).map((set: SetData) => set.reps! * set.weight!).filter((totalWeight) => totalWeight).reduce((acc, val) => acc + val, 0)}`;
}

function caloriesBurnt(workout: WorkoutData) {
    var activeTime = totalActiveTime(workout) + 120000
    const calories = Math.floor(7.5 * activeTime / 60000)
    return `Approximate Calories Burnt: ${calories}`
}

function activeTime(workout: WorkoutData) {
    const time = totalActiveTime(workout)
    const percent = Math.round(totalActiveTime(workout) / totalDuration(setTimes(workout)) * 100)
    return `Active Time: ${time} (${percent}%)`
}

function targetRepsReached(workout: WorkoutData) {
    const sets = workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets).filter((set: SetData) => set.reps && set.reps >= set.target!).length
    const percent = Math.round(sets / workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets).length * 100)
    return `Target reps reached on ${sets} sets (${percent}%).`
}

function totalActiveTime(workout: WorkoutData) {
    const times = setTimes(workout).sort()
    var totalActiveTime = 0
    for (let i = 0; i < times.length - 1; i++) {
        //TODO add reps*10s to each exercise
        totalActiveTime += Math.min(120000, times[i + 1] - times[i])
    }
    return totalActiveTime
}

function didYouKnow(workout: WorkoutData) {
    return DID_YOU_KNOWS[Math.min(...setTimes(workout)) % DID_YOU_KNOWS.length]
}

function tip(workout: WorkoutData) {
    return TIPS[Math.min(...setTimes(workout)) % TIPS.length]
}

function stat(workout: WorkoutData) {
    return STATS[Math.min(...setTimes(workout)) % STATS.length](workout)
}

export const Completion = (props: CompletionProps): JSX.Element => {
    if (!props.showCompletion) {
        return <vstack />
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => props.setShowCompletion(false)} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    <text wrap>{stat(props.workout)}</text>
                    <spacer/>
                    <text>Tip</text>
                    <text wrap>{tip(props.workout)}</text>
                    <spacer/>
                    <text>Did you know?</text>
                    <text wrap>{didYouKnow(props.workout)}</text>
                    <text></text>
                </vstack>
            </vstack>
        </zstack>
    )
}