import { Devvit } from '@devvit/public-api';

interface ProgressBarProps {
    setDonenesses: boolean[][]
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {
    return (<vstack height="100%" alignment="start middle"><vstack height="50%" padding="small" gap="small" cornerRadius='small'>
        {props.setDonenesses.map((exercise) => exercise.map((set) => set ? <vstack backgroundColor='green' width="20px" grow/>: <vstack backgroundColor='gray' width="20px" grow/>))}
      </vstack></vstack>)
}