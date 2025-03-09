import { Devvit, StateSetter, useState } from "@devvit/public-api"

interface IntroProps {
}

export const Intro = (props: IntroProps): JSX.Element => {
    const [showIntro, setShowIntro] = useState(true)
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
                    <text>Workit guides you through, while you log</text>
                    <text>reps and weights.</text>
                    <spacer/>
                    <text>When you're done, Workit will summarize</text>
                    <text>your workout in a comment.</text>
                    <spacer/>
                    <text>Target reps and weights are suggestions--</text>
                    <text>adjust as needed!</text>
                    <spacer/>
                    <hstack alignment="center middle" width="100%">
                        <button icon="play" appearance="primary" onPress={close}>Continue</button>
                    </hstack>
                </vstack>
            </vstack>
        </zstack>
    )
}