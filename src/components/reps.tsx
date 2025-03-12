import { Devvit } from '@devvit/public-api';

interface RepsProps {
    reps?: number
    target?: string
    primary: boolean
    increaseReps: () => void
    decreaseReps: () => void
    onPress: () => void

}

export const Reps = (props: RepsProps): JSX.Element => {
    return (
        props.reps != undefined && props.reps != 0 ?
        <hstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px">
            <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={props.decreaseReps}><icon name="subtract" size="xsmall" color="black"/></vstack>
            <spacer grow />
            <vstack onPress={props.onPress}><text size="xlarge" alignment='center middle' color="black" onPress={props.onPress}>{props.reps!}</text></vstack>
            <spacer grow />
            <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={props.increaseReps}><icon name="add" size="xsmall" color="black"/></vstack>
        </hstack> :
        <hstack backgroundColor={props.primary ? 'primary-background' : 'lightgray'} cornerRadius="small" padding="small" width="100px" height="40px" alignment='center middle' onPress={props.onPress}><text size="medium" alignment='center middle' color={props.primary ? "Global-White" : "gray"}>Target {props.target ?? ""}</text></hstack>
    )
}