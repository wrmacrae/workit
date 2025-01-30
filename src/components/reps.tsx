import { Devvit } from '@devvit/public-api';

interface RepsProps {
    reps?: number
    target?: string
    onPress: () => void
}

export const Reps = (props: RepsProps): JSX.Element => {
    return (
        props.reps != undefined && props.reps != 0 ?
        <vstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px" onPress={props.onPress}><text size="xlarge" alignment='center middle' color="black">{props.reps}</text></vstack> :
        <vstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px" onPress={props.onPress}><text size="medium" alignment='center middle' color="gray">Target {props.target ?? ""}</text></vstack>
    )
}