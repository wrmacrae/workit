import { Devvit, StateSetter, useState } from "@devvit/public-api"

interface IncompleteWarningProps {
    setExerciseIndex: StateSetter<number>
    setShowIncompleteWarning: StateSetter<boolean>
    completeWorkout: () => void
}

export const IncompleteWarning = (props: IncompleteWarningProps): JSX.Element => {
    const close = () => {
        props.setShowIncompleteWarning(false)
    }
    const complete = () => {
        props.setShowIncompleteWarning(false)
        props.completeWorkout()
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" onPress={close} lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    <text>You haven't maked all sets as done.</text>
                    <text>Would you like to complete the workout anyway?</text>
                    <spacer/>
                    <hstack alignment="center middle" width="100%">
                        <button icon="checkmark" onPress={complete}>Complete</button>
                        <spacer/>
                        <button icon="close" appearance="primary" onPress={close}>Cancel</button>
                    </hstack>
                </vstack>
            </vstack>
        </zstack>
    )
}