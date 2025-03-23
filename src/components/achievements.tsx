import { Devvit, StateSetter, useState } from "@devvit/public-api"
import { ExerciseData, SetData, WorkoutData } from "../types.js"
import { millisToString, setTimes, totalDuration } from "./timer.js"

interface AchievmentsProps {
    workout: WorkoutData
    workouts: {member: string; score: number;}[]
    showAchievements: boolean
    setShowAchievements: StateSetter<boolean>
}

export const Achievements = (props: AchievmentsProps): JSX.Element => {
    if (!props.showAchievements) {
        return <vstack />
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => props.setShowAchievements(false)} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    <text wrap>Many trophies</text>
                </vstack>
            </vstack>
        </zstack>
    )
}