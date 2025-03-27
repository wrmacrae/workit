import { Devvit, StateSetter } from '@devvit/public-api';

interface ProgressBarProps {
    supersetDoneness: boolean[][][]
    setExerciseIndex: StateSetter<number>
    setSummaryMode: StateSetter<boolean>
    exerciseIndex: number
    height: Devvit.Blocks.SizeString
}

export const MiniProgressBar = (props: ProgressBarProps): JSX.Element => {
    return (<vstack height="100%" padding="small">{ProgressBar(props)}</vstack>)
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
                return "success-background"
            }
            return "success-muted"
        }
        if (selected) {
            return "secondary-background-selected"
        }
        return "secondary-background"
    }
    const COLOR_TO_LIGHT = {
        "success-plain": "KiwiGreen-600",
        "success-background": "KiwiGreen-500",
        "success-muted": "KiwiGreen-400",
        "secondary-background-selected": "PureGray-300",
        "secondary-background": "PureGray-150",
    }
    const COLOR_TO_DARK = {
        "success-plain": "KiwiGreen-400",
        "success-background": "KiwiGreen-600",
        "success-muted": "KiwiGreen-700",
        "secondary-background-selected": "PureGray-600",
        "secondary-background": "PureGray-750",
    }
    function lightColorForSet(done: boolean, supersetIndex: number, exerciseIndex: number, selectedExerciseIndex: number) {
        return COLOR_TO_LIGHT[colorForSet(done, supersetIndex, exerciseIndex, selectedExerciseIndex)]        
    }
    function darkColorForSet(done: boolean, supersetIndex: number, exerciseIndex: number, selectedExerciseIndex: number) {
        return COLOR_TO_DARK[colorForSet(done, supersetIndex, exerciseIndex, selectedExerciseIndex)]        
    }
    return (
        <vstack height="100%" alignment="start middle">
            <vstack alignment="start middle" height={props.height} gap="small" cornerRadius='small'>
                {props.supersetDoneness.map((superset: boolean[][], supersetIndex: number) => <hstack grow gap="small" height={`${Number(props.height.toString().replace("%", ""))/superset.length}%`} onPress={() => {props.setExerciseIndex(exerciseIndexFinder[supersetIndex][0]); props.setSummaryMode(false)}} padding="xsmall" cornerRadius="small" border="thin" borderColor={colorForSet(false, supersetIndex, 0, props.exerciseIndex)}>
                    {superset.map((exercise, exerciseIndex) => <vstack gap="small">
                        {exercise.map((set) => <vstack cornerRadius="full"
                            lightBackgroundColor={lightColorForSet(set, supersetIndex, exerciseIndex, props.exerciseIndex)}
                            darkBackgroundColor={darkColorForSet(set, supersetIndex, exerciseIndex, props.exerciseIndex)}
                            width={`${width}px`} grow />)}
                    </vstack>)}
                </hstack>)}
            </vstack>
        </vstack>)
}

