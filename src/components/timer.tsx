import { Devvit, useInterval } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"
import { millisToString, totalDuration } from "../utils.js"

interface TimerProps {
    workout: WorkoutData
    exerciseIndex: number
}

function workoutDuration(times: number[]) {
    return Date.now() - Math.min(...times)
}

function restDuration(times: number[]) {
    return Date.now() - Math.max(...times)
}

function monospaceString(s: string, color: string) {
    return <hstack alignment="center middle">
        {s.split("").map((c: string) => <vstack width="9px" alignment="center middle"><text color={color}>{c}</text></vstack>)}
    </hstack>
}

export const Timer = (props: TimerProps): JSX.Element => {
    const times: number[] = setTimes(props.workout)
    if (times.length == 0) {
        return <vstack/>
    }
    if (props.workout.complete) {
        return (<vstack height="100%" width="100%" alignment="top end" padding="small">
            {monospaceString(millisToString(totalDuration(times)), "neutral-content")}
        </vstack>)
    }
    const interval = useInterval(() => {}, 1000).start();
    const showRest = !props.workout.exercises[props.exerciseIndex].sets.every((set) => !set.reps && !set.time) && !props.workout.exercises[props.exerciseIndex].sets.every((set) => set.reps || set.time)
    var restColor = "neutral-content"
    const rest = restDuration(times)
    if (rest >= 300000) {
        restColor = "danger-plain"
    } else if (rest >= 120000) {
        restColor = "caution-plain"
    }
    return (<vstack height="100%" width="100%" alignment="top end" padding="small">
            {monospaceString(millisToString(workoutDuration(times)), "neutral-content")}
            {showRest ? monospaceString(millisToString(restDuration(times)), restColor) : <vstack/>}
    </vstack>)
}

export function setTimes(workout: WorkoutData): number[] {
    return workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets).map((set: SetData) => set.repsEnteredTime).filter((value) => value != undefined)
}
