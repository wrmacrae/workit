import { Devvit, SetStateAction, StateSetter, useState } from '@devvit/public-api';
import { ExerciseData, SetData, WorkoutData } from '../types.js';

interface RepPickerProps {
    maxWidth: number
    repPickerIndices: number[]
    setRepPickerIndices: StateSetter<number[]>
    workout: WorkoutData
    setWorkout: (value: SetStateAction<WorkoutData>) => void
    setExerciseIndex: StateSetter<number>
    setPendingUpdates: StateSetter<never[]>
}

interface RepButtonProps {
    reps: number
    setReps: (reps: number) => void
    isTarget: boolean
}

const RepButton = (props: RepButtonProps): JSX.Element => {
    return <button appearance={props.isTarget ? "primary" : "secondary"} height="40px" width="50px" onPress={() => props.setReps(props.reps)}>{props.reps}</button>
}

function gridOfButtons(start: number, end: number, setReps: (reps: number) => void, setStart: StateSetter<number>, target: number): JSX.Element {
    return <hstack cornerRadius='medium' backgroundColor='neutral-background-container' padding="xsmall" gap="small" alignment="center middle"><button icon="caret-left" onPress={() => setStart(start-5 < 1 ? 1 : start-5)}/>{rowOfButtons(start, end, setReps, target)}<button icon="caret-right" onPress={() => setStart(start+5)}/></hstack>
}

function rowOfButtons(start: number, end: number, setReps: (reps: number) => void, target: number): JSX.Element {
    var buttons = []
    for (var i=start; i<end; i++) {
        buttons.push(<RepButton reps={i} setReps={setReps} isTarget={i==target}/>)
    }
    return <hstack gap="small" alignment="center middle">{buttons}</hstack>
}

export const RepPicker = (props: RepPickerProps): JSX.Element => {
    if (props.repPickerIndices.length < 2) {
        return <vstack />
    }
    const closePicker = () => {props.setRepPickerIndices([])}
    const setReps = (reps: number) => {
        props.workout.exercises[props.repPickerIndices[0]].sets[props.repPickerIndices[1]].reps = reps
        props.workout.exercises[props.repPickerIndices[0]].sets[props.repPickerIndices[1]].repsEnteredTime = Date.now()
        props.setWorkout(props.workout)
        var newRepPickerIndices = findNewRepPickerIndices(props.workout, props);
        // newRepPickerIndices = [0, 1]
        if (newRepPickerIndices.length > 0) {
            props.setExerciseIndex(newRepPickerIndices[0])
        }
        props.setRepPickerIndices(newRepPickerIndices)
        props.setPendingUpdates(prev => [...prev, props.workout]);
      };  
    const target = props.workout.exercises[props.repPickerIndices[0]].sets[props.repPickerIndices[1]].target!
    const [start, setStart] = useState(target - 2 >= 1 ? target - 2 : 1)
    return (
        <zstack height="100%" width="100%" alignment="center bottom">
            <vstack height="100%" width="100%" onPress={closePicker} />
            <vstack height="100%" alignment="center bottom">
                {gridOfButtons(start, start + 5, setReps, setStart, target)}
            </vstack>
        </zstack>
    )
}

// TODO Superset logic including refactoring Mobile Mode
function findNewRepPickerIndices(newWorkout: any, props: RepPickerProps) {
    var newRepPickerIndices: number[] = [];
    // if (newWorkout.exercises[props.repPickerIndices[0]].superset && newWorkout.exercises.length > props.repPickerIndices[0]) {
    //     const setIndex = newWorkout.exercises[props.repPickerIndices[0] + 1].sets.findIndex((set: SetData) => !set.reps);
    //     if (setIndex >= 0) {
    //         newRepPickerIndices = [[props.repPickerIndices[0] + 1], setIndex];
    //     }
    // }
    if (newRepPickerIndices.length == 0) {
        const exerciseIndex = newWorkout.exercises.findIndex((exercise: ExerciseData, exerciseIndex: number) => exerciseIndex >= props.repPickerIndices[0] && exercise.sets.findIndex((set: SetData) => !set.reps) >= 0);
        if (exerciseIndex == props.repPickerIndices[0]) {
        // if (exerciseIndex >= 0) {
            const setIndex = newWorkout.exercises[exerciseIndex].sets.findIndex((set: SetData) => !set.reps);
            if (setIndex >= 0) {
                newRepPickerIndices = [exerciseIndex, setIndex];
                // props.setExerciseIndex(exerciseIndex);
            }
        }
    }
    return newRepPickerIndices;
}
