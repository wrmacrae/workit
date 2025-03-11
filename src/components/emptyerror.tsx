import { Devvit, StateSetter, useState } from "@devvit/public-api"

interface EmptyErrorProps {
    setExerciseIndex: StateSetter<number>
    setShowEmptyError: StateSetter<boolean>
}

export const EmptyError = (props: EmptyErrorProps): JSX.Element => {
    const close = () => {
        props.setShowEmptyError(false)
    }
    const closeAndReturn = () => {
        props.setShowEmptyError(false)
        props.setExerciseIndex(0)
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" onPress={close} lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    <text>You haven't maked any sets as completed.</text>
                    <text>As you do each set, click the blue reps</text>
                    <text>field to mark the set as done.</text>
                    <spacer/>
                    <text>Your workout summary will only include</text>
                    <text>sets that you marked as complete (they'll</text>
                    <text>turn green). As you complete sets, check</text>
                    <text>that they show the weight and reps you did.</text>
                    <spacer/>
                    <hstack alignment="center middle" width="100%">
                        <button icon="refresh" appearance="primary" onPress={closeAndReturn}>Return to Start</button>
                    </hstack>
                </vstack>
            </vstack>
        </zstack>
    )
}