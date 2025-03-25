import { Devvit, IconName, StateSetter, useAsync, useState } from "@devvit/public-api"
import { ExerciseData, loadingWorkout, SetData, WorkoutData } from "../types.js"
import { millisToString, setTimes, totalDuration } from "./timer.js"
import { keyForWorkout } from "../keys.js"

interface AchievmentsProps {
    workout: WorkoutData
    workouts: {member: string; score: number;}[]
    showAchievements: boolean
    setShowAchievements: StateSetter<boolean>
    context: Devvit.Context
}

interface CategoryProps {
    name: string
    icon: IconName
    acquired: number
    targets: string[]
}

async function asyncMap<T, U>(
    array: T[],
    callback: (item: T, index: number, array: T[]) => Promise<U>
  ): Promise<U[]> {
    return Promise.all(array.map(callback));
}

function calculateStreak(workouts: {member: string; score: number;}[]) {
    const completionTimes = workouts.map((workout) => workout.score)    
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    let maxWeeks = 0;
    let i = 0;
    while (i < completionTimes.length) {
        let start = completionTimes[i];
        let end = start + ONE_WEEK;
        
        while (i < completionTimes.length && completionTimes[i] < end) {
            end = completionTimes[i] + ONE_WEEK
            i++;
        }
        let streak = Math.floor((end - start) / ONE_WEEK)
        
        maxWeeks = Math.max(maxWeeks, streak);
    }
    return maxWeeks;
}

const COLORS = ["neutral-content", "neutral-content", "neutral-content", "#CD7F32", "#C0C0C0", "#FFD700"]

const Category = (props: CategoryProps): JSX.Element => {
    return (<vstack gap="small">
        <text size="large">{props.name}</text>
        <hstack gap="small">{[...Array(props.targets.length).keys()].map(i =>
            <vstack height="50px" width="50px" alignment="center middle" backgroundColor={props.acquired > i ? "success-background" : "secondary-background"} cornerRadius="small" padding="xsmall">
                <icon size="large" color={COLORS[i]} name={props.acquired > i ? `${props.icon}-fill` : props.icon} />
                <text size="xsmall">{props.targets[i]}</text>
            </vstack>)
        }</hstack>
    </vstack>)
}

function acquiredTargets(targets: number[], value: number) {
    const firstTargetNotReached = targets.findIndex(target => target > value)
    return firstTargetNotReached == -1 ? aquiredTargets.length : firstTargetNotReached
}

export const Achievements = (props: AchievmentsProps): JSX.Element => {
    if (!props.showAchievements) {
        return <vstack />
    }
    const {data, loading, error} = useAsync(async () => {
        const allWorkouts: WorkoutData[] = await asyncMap(props.workouts, async workout => JSON.parse(await props.context.redis.get(keyForWorkout(workout.member, props.context.userId!)) ?? JSON.stringify(loadingWorkout)))
        var data = {
            workouts: allWorkouts.length,
            streak: calculateStreak(props.workouts),
            weight: allWorkouts.flatMap(workout => workout.exercises).flatMap((exercise: ExerciseData) => exercise.sets).map((set: SetData) => (set.reps ?? 0) * (set.weight ?? 0)).reduce((acc, val) => acc + val, 0),
            reps: allWorkouts.flatMap(workout => workout.exercises).flatMap((exercise: ExerciseData) => exercise.sets).map((set: SetData) => (set.reps ?? 0)).reduce((acc, val) => acc + val, 0),
            time: allWorkouts.map(workout => totalDuration(setTimes(workout))).reduce((acc, val) => acc + val, 0)
        }
        return data
    }, {
        depends: [props.context.userId!, props.workout.exercises.map(exercise => exercise.name)],
    });
    if (loading || !data) {
        return <text>Computing Achievements...</text>;
    }
    if (error) {
        return <text>Error: {error.message}</text>;
    }
    const workoutTargets = [1, 5, 10, 25, 35, 45]
    const workoutsAquired = acquiredTargets(workoutTargets, data.workouts)
    const streakTargets = [1, 2, 3, 5, 8, 12]
    const streakAquired = acquiredTargets(streakTargets, data.streak)
    const weightTargets = [2000, 10000, 30000, 100000, 250000, 500000]
    const weightAcquired = acquiredTargets(weightTargets, data.weight)
    const repsTargets = [100, 200, 500, 1000, 2000, 3000]
    const repsAquired = acquiredTargets(repsTargets, data.reps)
    const hourTargets = [1, 2, 4, 8, 16, 24]
    const timeAquired = acquiredTargets(hourTargets.map(h => h + 60 * 60 * 1000), data.time)+6
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => props.setShowAchievements(false)} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium" gap="medium">
                    <Category name={"Number of Workouts"} targets={workoutTargets.map(n => String(n))} acquired={workoutsAquired} icon={"contest"}/>
                    <Category name={"Weekly Streek"} targets={streakTargets.map(n => String(n))} acquired={streakAquired} icon={"calendar"} />
                    <Category name={"Total Weight"} targets={weightTargets.map(n => String(n).replace(/000$/,",000"))} acquired={weightAcquired} icon={"topic-law"} />
                    <Category name={"Total Reps"} targets={repsTargets.map(n => String(n).replace(/000$/,",000"))} acquired={repsAquired} icon={"activity"} />
                    <Category name={"Total Time"} targets={hourTargets.map(hours => `${hours}h`)} acquired={timeAquired} icon={"history"} />
                </vstack>
            </vstack>
        </zstack>
    )
}