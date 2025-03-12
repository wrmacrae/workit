import { Devvit, StateSetter } from '@devvit/public-api';

interface ProgressBarProps {
    supersetDoneness: boolean[][][]
    setExerciseIndex: StateSetter<number>
    exerciseIndex: number
}

export const ProgressBar = (props: ProgressBarProps): JSX.Element => {
    const width = 30 / Math.max(...props.supersetDoneness.map((superset: boolean[][]) => superset.length))
    var i = 0
    const exerciseIndexFinder: number[][] = []
    for (let s = 0; s < props.supersetDoneness.length; s++) {
        exerciseIndexFinder[s] = []
        for (let e = 0; e < props.supersetDoneness[s].length; e++) {
            exerciseIndexFinder[s][e] = i
            i++
        }
    }
    function supersetOfExercise(exerciseIndex: number) {
        return exerciseIndexFinder.findIndex((superset: number[]) => superset.findIndex((e) => e==exerciseIndex) != -1);
    }
    return (<vstack height="100%" alignment="start middle"><vstack height="70%" padding="small" gap="medium" cornerRadius='small'>
        {props.supersetDoneness.map((superset: boolean[][], supersetIndex: number) => <hstack grow gap="small" onPress={() => props.setExerciseIndex(exerciseIndexFinder[supersetIndex][0])} padding="xsmall" cornerRadius="small" border="thin" borderColor={supersetOfExercise(exerciseIndexFinder[supersetIndex][0]) == supersetOfExercise(props.exerciseIndex) ? "secondary-background-selected" : "secondary-background"}>
            {superset.map((exercise, exerciseIndex) => <vstack grow gap="small">
                {exercise.map((set) => <vstack cornerRadius="full"
                    backgroundColor={set ? (supersetOfExercise(exerciseIndexFinder[supersetIndex][exerciseIndex])  == supersetOfExercise(props.exerciseIndex) ? "success-background" : "success-background") : (supersetOfExercise(exerciseIndexFinder[supersetIndex][exerciseIndex]) == supersetOfExercise(props.exerciseIndex) ? "secondary-background-selected" : "secondary-background")}
                    width={`${width}px`} grow />)}
            </vstack>)}
        </hstack>)}
    </vstack></vstack>)
}

