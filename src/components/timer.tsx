import { Devvit, useInterval } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"

interface TimerProps {
    workout: WorkoutData
}

function workoutDuration(times: number[]) {
    return Date.now() - Math.min(...times)
}

function restDuration(times: number[]) {
    return Date.now() - Math.max(...times)
}

function totalDuration(times: number[]) {
    return Math.max(...times) - Math.min(...times)
}

function millisToString(time: number) {
    const date = new Date(Date.UTC(0,0,0,0,0,0,time))
    var parts = [
      Math.floor(time / 3600000),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    ]
    if (parts[0] == 0) {
        parts.splice(0, 1)
    }
    return parts.map(s => String(s).padStart(2,'0')).join(':');
}

function monospaceString(s: string, color: string) {
    return <hstack alignment="center middle">
        {s.split("").map((c: string) => <vstack width="9px" alignment="center middle"><text color={color}>{c}</text></vstack>)}
    </hstack>
}

export const Timer = (props: TimerProps): JSX.Element => {
    const times: number[] = props.workout.exercises.flatMap((exercise: ExerciseData) => exercise.sets).map((set: SetData) => set.repsEnteredTime).filter((value) => value != undefined)
    if (times.length == 0) {
        return <vstack/>
    }
    if (props.workout.complete) {
        return (<vstack height="100%" width="100%" alignment="top end" padding="small">
            {monospaceString(millisToString(totalDuration(times)), "neutral-content")}
        </vstack>)
    }
    const interval = useInterval(() => {}, 1000).start();
    var restColor = "neutral-content"
    const rest = restDuration(times)
    if (rest >= 120000) {
        restColor = "danger-plain"
    } else if (rest >= 60000) {
        restColor = "caution-plain"
    }
    return (<vstack height="100%" width="100%" alignment="top end" padding="small">
            {monospaceString(millisToString(workoutDuration(times)), "neutral-content")}
            {monospaceString(millisToString(restDuration(times)), restColor)}
    </vstack>)
}