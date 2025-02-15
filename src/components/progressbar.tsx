import { Devvit } from '@devvit/public-api';

interface ProgressBarProps {
    setDonenesses: boolean[]
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {
    return (<vstack height="100%">
        {props.setDonenesses.map((set) => set ? <vstack backgroundColor='green' width="20px" grow/>: <vstack backgroundColor='gray' width="20px" grow/>)}
      </vstack>)
}