import { Devvit, StateSetter, useInterval, useState } from '@devvit/public-api';
import { SetData, WorkoutData } from '../types.js';
import { millisToString } from './timer.js';

interface RepsProps {
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
    const [time, setTime] = useState(0)
    const [running, setRunning] = useState(false)
    const interval = useInterval(() => {running ? setTime(time + 1000) : 0}, 1000);

    function saveWorkout() {
        props.setWorkout(props.workout);
        props.setPendingUpdates(prev => [...prev, props.workout]);
    }

    function toggleTimer() {
        if (running) {
            interval.stop()
            props.set.time = time
            saveWorkout()
        } else {
            interval.start()
            setTime(time + 1)
        }
        setRunning(!running)
    }

    function reset() {
        interval.stop()
        setRunning(false)
        delete props.set.time
        setTime(0)
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
    if (props.set.time || time) {
        return (
            <hstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px">
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={toggleTimer}><icon name={running ? "pause" : "play"} size="xsmall" color="black"/></vstack>
                <spacer grow />
                <vstack onPress={toggleTimer}><text size="large" alignment='center middle' color="black">{running ? millisToString(time) : millisToString(props.set.time)}</text></vstack>
                <spacer grow />
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={reset}><icon name="delete" size="xsmall" color="black"/></vstack>
            </hstack>
        )
    }
    return (
        <hstack backgroundColor={props.primary ? 'primary-background' : 'lightgray'} cornerRadius="small" padding="small" width="100px" height="40px" alignment='center middle' onPress={props.set.targetTime ? toggleTimer : props.onPress}><text size="medium" alignment='center middle' color={props.primary ? "Global-White" : "gray"}>Target {String(props.set.target ?? millisToString(props.set.targetTime!))}</text></hstack>
    )
}