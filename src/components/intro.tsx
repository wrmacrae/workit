import { Devvit, StateSetter, useState } from "@devvit/public-api"

interface IntroProps {
    workouts: number
}

export const Intro = (props: IntroProps): JSX.Element => {
    const [showIntro, setShowIntro] = useState(props.workouts <= 3)
    if (!showIntro) {
        return <vstack />
    }
    const close = () => {
        setShowIntro(false)
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" onPress={close} lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start middle" padding="medium" cornerRadius="medium">
                    <text>Here is your private copy of the workout.</text>
                    <spacer/>
                    <text>When complete, Workit shares a comment.</text>
                    <spacer/>
                    <hstack alignment="center middle" width="100%">
                        <button icon="play" appearance="primary" onPress={close}>Continue</button>
                    </hstack>
                </vstack>
            </vstack>
        </zstack>
    )
}