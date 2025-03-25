import { Devvit, StateSetter, useAsync, useState } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"
import { setTimes } from "./timer.js"
import { millisToString, totalDuration } from "../utils.js"
import { asyncMap, formatExerciseAsComment } from "../utils.js"

interface ExerciseInfoProps {
    showExerciseInfo: ExerciseData[]
    setShowExerciseInfo: StateSetter<ExerciseData[]>
    workout: WorkoutData
    workouts: {member: string; score: number;}[]
    context: Devvit.Context
}

export const ExerciseInfo = (props: ExerciseInfoProps): JSX.Element => {
    if (props.showExerciseInfo.length == 0 || !props.showExerciseInfo[0].info) {
        return <vstack />
    }
    const {data, loading, error} = useAsync(async () => {
        const allWorkouts: WorkoutData[] = await asyncMap(props.workouts, async workout => JSON.parse(await props.context.redis.get(keyForWorkout(workout.member, props.context.userId!)) ?? JSON.stringify(loadingWorkout)))
        const allExercises: ExerciseData[] = allWorkouts.flatMap(workout => workout.exercises)
        return allExercises.find(exercise => exercise.name == props.showExerciseInfo[0].name)
    })
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => props.setShowExerciseInfo([])} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    {props.showExerciseInfo[0].info.split("\n").map(line => <text wrap>{line}</text>)}
                    <spacer/>
                    {data != undefined ? <text>Previous {formatExerciseAsComment(data)}</text> : <vstack />}
                </vstack>
            </vstack>
        </zstack>
    )
}