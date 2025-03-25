import { Devvit, StateSetter, useInterval, useState } from '@devvit/public-api';
import { SetData, WorkoutData } from '../types.js';
import { millisToString } from "../utils.js";

interface RepsProps {
    workout: WorkoutData
    exerciseIndex: number
    setIndex: number
    set: SetData
    primary: boolean
    increaseReps: () => void
    decreaseReps: () => void
    onPress: () => void
    setWorkout: StateSetter<WorkoutData>
    setPendingUpdates: StateSetter<never[]>
}

//TODO Why do I need 2d arrays for time and running? Something was weird with useInterval while running a time and paging around...
export const Reps = (props: RepsProps): JSX.Element => {
    const [running, setRunning] = useState([...Array(12)].map(e => Array(6).fill(0)))
    const interval = useInterval(() => {}, 1000).start();

    function saveWorkout() {
        props.setWorkout(props.workout);
        props.setPendingUpdates(prev => [...prev, props.workout]);
    }

    function totalTime() {
        const r = running[props.exerciseIndex][props.setIndex]
        return (r ? Date.now() - r : 0) + (props.set.time ?? 0);
    }
    
    function toggleTimer() {
        if (running[props.exerciseIndex][props.setIndex]) {
            props.set.time = totalTime()
            props.set.repsEnteredTime = Date.now()
            saveWorkout()
            running[props.exerciseIndex][props.setIndex] = 0
        } else {
            running[props.exerciseIndex][props.setIndex] = Date.now()
        }
        setRunning(running)
    }
    function reset() {
        running[props.exerciseIndex][props.setIndex] = 0
        setRunning(running)
        delete props.set.time
        delete props.set.repsEnteredTime
        saveWorkout()
    }

    if (props.set.reps) {
        return (
            <hstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px">
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={props.decreaseReps}><icon name="subtract" size="xsmall" color="black"/></vstack>
                <spacer grow />
                <vstack onPress={props.onPress}><text size="xlarge" alignment='center middle' color="black" onPress={props.onPress}>{props.set.reps!}</text></vstack>
                <spacer grow />
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={props.increaseReps}><icon name="add" size="xsmall" color="black"/></vstack>
            </hstack>
        )
    }
    if (props.set.time || running[props.exerciseIndex][props.setIndex]) {
        return (
            <hstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px">
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={toggleTimer}><icon name={running[props.exerciseIndex][props.setIndex] ? "pause" : "play"} size="xsmall" color="black"/></vstack>
                <spacer grow />
                <vstack onPress={toggleTimer}><text size="large" alignment='center middle' color="black">{millisToString(totalTime())}</text></vstack>
                <spacer grow />
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={reset}><icon name="delete" size="xsmall" color="black"/></vstack>
            </hstack>
        )
    }
    return (
        <hstack backgroundColor={props.primary ? 'primary-background' : 'lightgray'} cornerRadius="small" padding="small" width="100px" height="40px" alignment='center middle' onPress={props.set.targetTime ? toggleTimer : props.onPress}><text size="medium" alignment='center middle' color={props.primary ? "Global-White" : "gray"}>Target {String(props.set.target ?? millisToString(props.set.targetTime!))}</text></hstack>
    )
}
