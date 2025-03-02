import { Devvit, StateSetter } from '@devvit/public-api';

interface ProgressBarProps {
    setDonenesses: boolean[][]
    setExerciseIndex: StateSetter<number>
    exerciseIndex: number
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {
    return (<vstack height="100%" alignment="start middle"><vstack height="50%" padding="small" gap="medium" cornerRadius='small'>
        {props.setDonenesses.map((exercise, exerciseIndex) => <vstack grow gap="small">{exercise.map((set) => <vstack backgroundColor={set ? (exerciseIndex == props.exerciseIndex ? "green" : "darkgreen") : (exerciseIndex == props.exerciseIndex ? "lightgray" : "gray")} width="20px" grow onPress={() => props.setExerciseIndex(exerciseIndex)}/>)}</vstack>)}
      </vstack></vstack>)
}