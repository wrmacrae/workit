import { Devvit } from '@devvit/public-api';

interface SetNumberProps {
    done?: boolean
    setNumber: number
}

export const SetNumber = (props: SetNumberProps): JSX.Element => {
    return (
        <vstack backgroundColor={props.done ?? false ? 'darkgreen' : 'gray'} cornerRadius="small" padding="small" width="40px"><text size="xlarge" alignment='center middle'>{props.setNumber}</text></vstack>
    )
}