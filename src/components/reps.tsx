import { Devvit, StateSetter, useInterval, useState } from '@devvit/public-api';
import { SetData, WorkoutData } from '../types.js';
import { millisToString } from './timer.js';

interface RepsProps {
    exerciseIndex: number
    workout: WorkoutData
    set: SetData
    primary: boolean
    increaseReps: () => void
    decreaseReps: () => void
    onPress: () => void
    setWorkout: StateSetter<WorkoutData>
    setPendingUpdates: StateSetter<never[]>
}

export const Reps = (props: RepsProps): JSX.Element => {
    const [running, setRunning] = useState<number>(0)
    const interval = useInterval(() => {}, 1000).start();

    function saveWorkout() {
        props.setWorkout(props.workout);
        props.setPendingUpdates(prev => [...prev, props.workout]);
    }

    function totalTime() {
        return (running ? Date.now() - running : 0) + (props.set.time ?? 0);
    }
    
    function toggleTimer() {
        if (running) {
            props.set.time = totalTime()
            saveWorkout()
            setRunning(0)
        } else {
            setRunning(Date.now())
        }
    }

    function reset() {
        setRunning(0)
        delete props.set.time
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
    if (props.set.time || running) {
        return (
            <hstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px">
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={toggleTimer}><icon name={running ? "pause" : "play"} size="xsmall" color="black"/></vstack>
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