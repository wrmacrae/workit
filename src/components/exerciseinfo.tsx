import { Devvit, StateSetter, useState } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"
import { millisToString, setTimes, totalDuration } from "./timer.js"

interface ExerciseInfoProps {
    showExerciseInfo: ExerciseData[]
    setShowExerciseInfo: StateSetter<ExerciseData[]>
}

export const ExerciseInfo = (props: ExerciseInfoProps): JSX.Element => {
    if (props.showExerciseInfo.length == 0 || !props.showExerciseInfo[0].info) {
        return <vstack />
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => props.setShowExerciseInfo([])} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    {props.showExerciseInfo[0].info.split("\n").map(line => <text wrap>{line}</text>)}
                </vstack>
            </vstack>
        </zstack>
    )
}