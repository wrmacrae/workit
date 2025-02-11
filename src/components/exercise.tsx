import { Devvit, JSONArray } from '@devvit/public-api';
import { DisabledWeight, Weight } from './weight.js';
import { Reps } from './reps.js';
import { SetNumber } from './setnumber.js';

interface ExerciseProps {
    name: string
    image: string
    sets: JSONArray
    onRepsClick: (setIndex: number) => void
    increaseWeightForIndex: (setIndex: number) => void
    decreaseWeightForIndex: (setIndex: number) => void
    edit: (() => void) | undefined
}

function setNumbers(sets: JSONArray) {
    var setNumbers = []
    for (let i = 0; i < sets.length; i++)  {
        setNumbers.push(<SetNumber setNumber={i+1} done={sets[i].reps != undefined && sets[i].reps != 0} />)
    }
    return (
        <vstack alignment="center top" gap="small">
            <text size="small" alignment='center middle'>Set</text>
            {setNumbers}
        </vstack>
    )
}

function reps(sets: JSONArray, onRepsClick: (setIndex: number) => void) {
    var reps = []
    for (let i = 0; i < sets.length; i++)  {
        reps.push(<Reps reps={sets[i].reps} target={sets[i].target} onPress={() => onRepsClick(i)}/>)
    }
    return (
        <vstack alignment="center top" gap="small">
            <text size="small" alignment='center middle'>Reps</text>
            {reps}
        </vstack>
    )
}

function xs(sets: JSONArray) {
    return (
        <vstack alignment="center middle" gap="small">
            <vstack height="16px"></vstack>
            {Array(sets.length).map((set) => <vstack cornerRadius="small" padding="small" width="25px" height="40px"><text size="xlarge" alignment='center middle'>x</text></vstack>)}
        </vstack>
    )
}

function weights(sets: JSONArray, increaseWeightForIndex: (setIndex: number) => void, decreaseWeightForIndex: (setIndex: number) => void) {
    var weights = []
    for (let i = 0; i < sets.length; i++)  {
        if (sets[i].weight != undefined) {
            weights.push(<Weight weight={sets[i].weight} increaseWeight={() => increaseWeightForIndex(i)} decreaseWeight={() => decreaseWeightForIndex(i)}/>)
        } else {
            weights.push(<DisabledWeight />)
        }
    }
    return (
    <vstack alignment="center middle" gap="small">
        <text size="small" alignment='center middle'>Weight</text>\
        {weights}
    </vstack>)
}

export const Exercise = (props: ExerciseProps): JSX.Element => {
    return (
        <vstack gap="medium">
            <hstack cornerRadius='large' height='100%' alignment='middle' onPress={props.edit} grow><image url={props.image} width="280px" height={String(350 - props.sets.length * 50) + "px"} resizeMode='cover'></image></hstack>
            <text size="xlarge" alignment="center top" onPress={props.edit}>{props.name}</text>
            <hstack alignment="center top" gap="small">
              {setNumbers(props.sets)}
              {reps(props.sets, props.onRepsClick)}
              {xs(props.sets)}
              {weights(props.sets, props.increaseWeightForIndex, props.decreaseWeightForIndex)}
            </hstack>
          </vstack>
    )
}