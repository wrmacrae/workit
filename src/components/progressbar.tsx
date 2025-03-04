import { Devvit, StateSetter } from '@devvit/public-api';

interface ProgressBarProps {
    setDonenesses: boolean[][]
    setExerciseIndex: StateSetter<number>
    exerciseIndex: number
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {
    return (<vstack height="100%" alignment="start middle"><vstack height="70%" padding="small" gap="medium" cornerRadius='small'>
        {props.setDonenesses.map((exercise, exerciseIndex) => <vstack grow gap="small">{exercise.map((set) => <vstack cornerRadius="full" backgroundColor={set ? (exerciseIndex == props.exerciseIndex ? "success-background" : "success-background") : (exerciseIndex == props.exerciseIndex ? "secondary-background-selected" : "secondary-background")} width="30px" grow onPress={() => props.setExerciseIndex(exerciseIndex)}/>)}</vstack>)}
      </vstack></vstack>)
}