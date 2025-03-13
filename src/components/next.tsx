import { Devvit, useInterval } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"

interface NextProps {
    workout: WorkoutData
    supersetGrid: ExerciseData[][]
    exerciseIndex: number
}

export const Next = (props: NextProps): JSX.Element => {
    const exerciseIndexFinder: number[][] = []
    var i = 0
    for (let s = 0; s < props.supersetGrid.length; s++) {
        exerciseIndexFinder[s] = []
        for (let e = 0; e < props.supersetGrid[s].length; e++) {
            exerciseIndexFinder[s][e] = i
            i++
        }
    }
    const supersetOfExercise = exerciseIndexFinder.findIndex((superset: number[]) => superset.findIndex((e) => e==props.exerciseIndex) != -1);
    if (supersetOfExercise == props.supersetGrid.length - 1) {
        return <vstack />
    }
    const nextExercises = props.supersetGrid[supersetOfExercise + 1]
    if (nextExercises.length == 1) {
        return (<vstack height="100%" width="100%" alignment="bottom end" padding="small">
            <text>Next: {nextExercises[0].name}{nextExercises[0].sets[0].weight ? ` at ${nextExercises[0].sets[0].weight}` : ""}</text>
        </vstack>)
    }
    return (<vstack height="100%" width="100%" alignment="bottom center" padding="small">
        <hstack width="100%">
            <text>Next: {nextExercises[0].name}{nextExercises[0].sets[0].weight ? ` at ${nextExercises[0].sets[0].weight}` : ""}</text>
            <spacer grow />
            <text>Next: {nextExercises[1].name}{nextExercises[1].sets[1].weight ? ` at ${nextExercises[1].sets[1].weight}` : ""}</text>
        </hstack>
    </vstack>)
}