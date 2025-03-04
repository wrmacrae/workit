import { Devvit, StateSetter, useState } from "@devvit/public-api"

interface IntroProps {
    setRepPickerIndices: StateSetter<number[]>
}

export const Intro = (props: IntroProps): JSX.Element => {
    const [showIntro, setShowIntro] = useState(true)
    if (!showIntro) {
        return <vstack />
    }
    const close = () => {
        setShowIntro(false)
        props.setRepPickerIndices([0, 0])
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" onPress={close} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack backgroundColor="gray" alignment="start middle" padding="medium" cornerRadius="medium">
                    {/* <icon name="info" /> */}
                    <text>You are seeing your own copy of this workout.</text>
                    <text>Workit guides you through set-by-set,</text>
                    <text>and you log the reps and weights as you go.</text>
                    <text>When you're done, Workit will summarize</text>
                    <text>your workout in a comment.</text>
                    <text>Until then, this is a private view.</text>
                    <text>Target reps and default weights are suggestions,</text>
                    <text>and you should pick what works for you!</text>
                    {/* <text>You can also swap out an exercise if it doesn't suit you.</text> */}
                    <spacer/>
                    <hstack alignment="center middle" width="100%">
                        <button icon="play" appearance="primary" onPress={close}>Continue</button>
                    </hstack>
                </vstack>
            </vstack>
        </zstack>
    )
}