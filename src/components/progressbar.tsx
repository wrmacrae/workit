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
    function colorForSet(done: boolean, supersetIndex: number, exerciseIndex: number, selectedExerciseIndex: number) {
        const selected = supersetOfExercise(exerciseIndexFinder[supersetIndex][exerciseIndex]) == supersetOfExercise(props.exerciseIndex)
        if (done) {
            if (selected) {
                return "success-plain"
            }
            return "success-background"
        }
        if (selected) {
            return "secondary-background-selected"
        }
        return "secondary-background"
    }
    return (<vstack height="100%" alignment="start middle"><vstack alignment="start middle" height="70%" padding="small" gap="medium" cornerRadius='small'>
        {props.supersetDoneness.map((superset: boolean[][], supersetIndex: number) => <hstack grow gap="small" onPress={() => props.setExerciseIndex(exerciseIndexFinder[supersetIndex][0])} padding="xsmall" cornerRadius="small" border="thin" borderColor={colorForSet(false, supersetIndex, 0, props.exerciseIndex)}>
            {superset.map((exercise, exerciseIndex) => <vstack grow gap="small">
                {exercise.map((set) => <vstack cornerRadius="full"
                    backgroundColor={colorForSet(set, supersetIndex, exerciseIndex, props.exerciseIndex)}
                    width={`${width}px`} grow />)}
            </vstack>)}
        </hstack>)}
    </vstack></vstack>)
}

