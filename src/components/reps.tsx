import { Devvit, StateSetter, useInterval, useState } from '@devvit/public-api';
import { SetData, WorkoutData } from '../types.js';
import { millisToString } from './timer.js';

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
    const [time, setTime] = useState([...Array(10)].map(e => Array(10)))
    const [running, setRunning] = useState([...Array(10)].map(e => Array(10)))
    const interval = useInterval(() => {running[props.exerciseIndex][props.setIndex] ? time[props.exerciseIndex][props.setIndex] += 1000 : 0; setTime(time)}, 1000);
    function saveWorkout() {
        props.setWorkout(props.workout);
        props.setPendingUpdates(prev => [...prev, props.workout]);
    }
    function toggleTimer() {
        if (running[props.exerciseIndex][props.setIndex]) {
            interval.stop()
            props.set.time = time[props.exerciseIndex][props.setIndex]
            props.set.repsEnteredTime = Date.now()
            saveWorkout()
        } else {
            interval.start()
            time[props.exerciseIndex][props.setIndex] += 1
            setTime(time)
        }
        running[props.exerciseIndex][props.setIndex] = !running[props.exerciseIndex][props.setIndex]
        setRunning(running)
    }
    function reset() {
        interval.stop()
        running[props.exerciseIndex][props.setIndex] = false
        setRunning(running)
        delete props.set.time
        delete props.set.repsEnteredTime
        time[props.exerciseIndex][props.setIndex] = 0
        setTime(time)
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
    if (props.set.time || time[props.exerciseIndex][props.setIndex]) {
        return (
            <hstack backgroundColor='lightgray' cornerRadius="small" padding="small" width="100px" height="40px">
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={toggleTimer}><icon name={running[props.exerciseIndex][props.setIndex] ? "pause" : "play"} size="xsmall" color="black"/></vstack>
                <spacer grow />
                <vstack onPress={toggleTimer}><text size="large" alignment='center middle' color="black">{running[props.exerciseIndex][props.setIndex] ? millisToString(time[props.exerciseIndex][props.setIndex]) : millisToString(props.set.time)}</text></vstack>
                <spacer grow />
                <vstack cornerRadius="small" borderColor='gray' alignment='center middle' padding="xsmall" onPress={reset}><icon name="delete" size="xsmall" color="black"/></vstack>
            </hstack>
        )
    }
    return (
        <hstack backgroundColor={props.primary ? 'primary-background' : 'lightgray'} cornerRadius="small" padding="small" width="100px" height="40px" alignment='center middle' onPress={props.set.targetTime ? toggleTimer : props.onPress}><text size="medium" alignment='center middle' color={props.primary ? "Global-White" : "gray"}>Target {String(props.set.target ?? millisToString(props.set.targetTime!))}</text></hstack>
    )
}