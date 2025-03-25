import { Devvit, useInterval } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"

interface NextProps {
    workout: WorkoutData
    supersetGrid: ExerciseData[][]
    exerciseIndex: number
    addExercises: () => void
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
        if (props.workout.optionalExercises && props.workout.optionalExercises.length > 0) {
            return (<vstack height="100%" width="100%" alignment="bottom end" padding="small">
                        <button icon="add" onPress={props.addExercises} />
                    </vstack>)
        }
        return <vstack />
    }
    const nextExercises = props.supersetGrid[supersetOfExercise + 1]
    if (nextExercises.length == 1) {
        return (<vstack height="100%" width="100%" alignment="bottom end" padding="small">
            <vstack>
                <text>Next:</text>
                <text>{nextExercises[0].name}{nextExercises[0].sets[0].weight ? ` at ${nextExercises[0].sets[0].weight}` : ""}</text>
            </vstack>
        </vstack>)
    }
    return (<vstack height="100%" width="100%" alignment="bottom center" padding="small">
        <hstack width="100%">
            <vstack>
                <text>Next:</text>
                <text>{nextExercises[0].name}{nextExercises[0].sets[0].weight ? ` at ${nextExercises[0].sets[0].weight}` : ""}</text>
            </vstack>
            <spacer grow />
            <vstack>
            <text>Next:</text>
            <text>{nextExercises[1].name}{nextExercises[1].sets[0].weight ? ` at ${nextExercises[1].sets[0].weight}` : ""}</text>
            </vstack>
        </hstack>
    </vstack>)
}