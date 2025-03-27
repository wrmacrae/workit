import { Devvit, StateSetter, useState } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"
import { setTimes } from "./timer.js"
import { millisToString, totalActiveTime, totalDuration } from "../utils.js"

interface CompletionProps {
    workout: WorkoutData
    workouts: {member: string; score: number;}[]
    showCompletion: boolean
    setShowCompletion: StateSetter<boolean>
    setSummaryMode: StateSetter<boolean>
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
    "Share how your workout went in the comments. Making health social helps you stay consistent.",
    "Alternate cardio and strength. Blood flow from cardio aids in muscle recovery from strength.",
    "Try to exercise every 2 or 3 days. Your muscles need time to recover and grow.",
    "Get some feedback! Do a form check on Reddit or have a friend spot you.",
    "Now's a great time to research an exercise or muscle you were thinking about.",
    "Treat yourself! Buy or do something, big or small, as a reward. Maybe gear or a healthy snack?",
    "Sleep is critical for recovery. Take 7-9 hours, so that you get all the benefit of your hard work.",
    "Try asking a question in the comments!",
]

const STATS = [
    workouts,
    totalWeight,
    activeTime,
    caloriesBurnt,
    streak,
    targetRepsReached,
]

function totalWeight(props: CompletionProps) {
    const total = props.workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets).map((set: SetData) => (set.reps ?? 0) * set.weight!).filter((totalWeight) => totalWeight).reduce((acc, val) => acc + val, 0)
    if (!total) {return}
    return `Total Weight Lifted: ${total}`;
}

function caloriesBurnt(props: CompletionProps) {
    var activeTime = totalActiveTime(props.workout) + 120000
    const calories = Math.floor(7.5 * activeTime / 60000)
    return `Approximate Calories Burnt: ${calories}`
}

function activeTime(props: CompletionProps) {
    const time = totalActiveTime(props.workout)
    if (!time) {return}
    const percent = Math.round(totalActiveTime(props.workout) / totalDuration(setTimes(props.workout)) * 100)
    return `Active Time: ${millisToString(time)} (${percent}%)`
}

function targetRepsReached(props: CompletionProps) {
    const sets = props.workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets).filter((set: SetData) => (set.reps && set.reps >= set.target!) || (set.time && set.time >= set.targetTime!)).length
    if (!sets) {return}
    const percent = Math.round(sets / props.workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets).length * 100)
    return `Target reps reached on ${sets} sets (${percent}%).`
}

function workouts(props: CompletionProps) {
    if (props.workouts.length <= 1) {return}
    return `You have done ${props.workouts.length} workouts in this subreddit!`
}

function streak(props: CompletionProps) {
    const [weeks, workoutCount] = calculateStreak(props.workouts)
    if (weeks <= 1) {return}
    return `You completed exercises for ${weeks} weeks straight (a streak of ${workoutCount} workouts).`
}

function calculateStreak(workouts: {member: string; score: number;}[]) {
    const completionTimes = workouts.map((workout) => workout.score)
    var endOfWeek = Date.now()
    var workoutCount = 0
    var weeks = 0
    const WEEK = 604800000
    while (true) {
        const currentWeek = completionTimes.filter((t) => t >= endOfWeek - WEEK && t < endOfWeek)
        if (currentWeek.length == 0) {
            break
        }
        workoutCount += currentWeek.length
        weeks += 1
        endOfWeek -= WEEK
    }
    return [weeks, workoutCount]
}

function didYouKnow(workout: WorkoutData) {
    return DID_YOU_KNOWS[Math.min(...setTimes(workout)) % DID_YOU_KNOWS.length]
}

function tip(workout: WorkoutData) {
    return TIPS[Math.min(...setTimes(workout)) % TIPS.length]
}

function stat(props: CompletionProps) {
    var i = 0
    while (true) {
        let maybeStat = STATS[(Math.min(...setTimes(props.workout)) + i) % STATS.length](props)
        if (maybeStat) {
            return maybeStat
        }
        i++
    }
}

export const Completion = (props: CompletionProps): JSX.Element => {
    if (!props.showCompletion) {
        return <vstack />
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => {props.setShowCompletion(false); props.setSummaryMode(true)}} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    <text wrap>{stat(props)}</text>
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