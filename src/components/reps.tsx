import { Devvit } from '@devvit/public-api';

interface RepsProps {
    reps?: number
    target?: string
    onPress: () => void
}

export const Reps = (props: RepsProps): JSX.Element => {
    return (
        props.reps != undefined && props.reps != 0 ?
        <vstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px"><text size="xlarge" alignment='center middle' color="black" onPress={props.onPress}>{props.reps}</text></vstack> :
        <vstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px"><text size="medium" alignment='center middle' color="gray" onPress={props.onPress}>Target {props.target ?? ""}</text></vstack>
    )
}