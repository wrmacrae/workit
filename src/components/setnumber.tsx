import { Devvit } from '@devvit/public-api';

interface SetNumberProps {
    done?: boolean
    setNumber: number
    onPress: () => void
}

export const SetNumber = (props: SetNumberProps): JSX.Element => {
    return (
        <vstack backgroundColor={props.done ?? false ? 'success-background' : 'secondary-background'} cornerRadius="small" padding="small" width="40px" onPress={props.onPress}><text onPress={props.onPress} size="xlarge" alignment='center middle'>{props.setNumber}</text></vstack>
    )
}