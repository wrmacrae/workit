import { Devvit, useInterval, useState } from '@devvit/public-api';

interface RepsProps {
    reps?: number
    target?: string
    editMode: boolean
    onPress: () => void
}

export const Reps = (props: RepsProps): JSX.Element => {
    const [blinkOn, setBlinkOn] = useState(true)
    if (props.editMode) {
        useInterval(() => setBlinkOn(!blinkOn), 500).start()
    }
    return (
        <zstack>
            {props.reps != undefined && props.reps != 0 ?
            <vstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px" onPress={props.onPress}><text size="xlarge" alignment='center middle' color="black">{props.reps}</text></vstack> :
            <vstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px" onPress={props.onPress}><text size="medium" alignment='center middle' color="gray">Target {props.target ?? ""}</text></vstack>}
            {blinkOn && props.editMode ? <vstack cornerRadius="small" padding="small" width="100px" height="40px" onPress={props.onPress}><text size="xlarge" alignment='center middle' color="black">|</text></vstack> : <vstack/>}
        </zstack>
    )
}