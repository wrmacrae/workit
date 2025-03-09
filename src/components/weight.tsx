import { Devvit } from '@devvit/public-api';

interface WeightProps {
    weight: number
    increaseWeight: () => void
    decreaseWeight: () => void
    onPress: () => void
}

export const Weight = (props: WeightProps): JSX.Element => {
    return (
        <hstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px">
            <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={props.decreaseWeight}><icon name="subtract" size="xsmall" color="black"/></vstack>
            <spacer grow />
            <vstack onPress={props.onPress}><text size="xlarge" alignment='center middle' color="black" onPress={props.onPress}>{props.weight}</text></vstack>
            <spacer grow />
            <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={props.increaseWeight}><icon name="add" size="xsmall" color="black"/></vstack>
        </hstack>
    )
}

export const DisabledWeight = (): JSX.Element => {
    return <vstack backgroundColor='gray' cornerRadius="small" padding="small" width="100px" height="40px"><text size="xlarge" alignment='center middle'>-</text></vstack>

}