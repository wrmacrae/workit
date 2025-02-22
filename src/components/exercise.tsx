import { Devvit, JSONArray, SetStateAction, StateSetter, useForm } from '@devvit/public-api';
import { DisabledWeight, Weight } from './weight.js';
import { Reps } from './reps.js';
import { SetNumber } from './setnumber.js';
import { ExerciseData, SetData, WorkoutData } from '../types.js';
import { createExerciseFromForm, formatExerciseAsComment } from '../main.js';

interface ExerciseSummaryProps {
    exercise: ExerciseData
}

interface ExerciseProps {
    exerciseIndex: number
    increment: number
    onRepsClick: (setIndex: number) => void
    editMode: boolean
    context: Devvit.Context
    setWorkout: (value: SetStateAction<WorkoutData>) => void
    workout: WorkoutData
    setTemplate: (value: SetStateAction<WorkoutData>) => void
    template: WorkoutData
    setPendingUpdates: StateSetter<never[]>
    setPendingTemplateUpdates: StateSetter<never[]>
    setExerciseIndex: StateSetter<number>
}
const increaseWeightForIndex = (props: ExerciseProps, setIndex: number) => () => {
    const newWorkout = JSON.parse(JSON.stringify(props.workout))
    const newWeight = newWorkout.exercises[props.exerciseIndex].sets[setIndex].weight + props.increment
    newWorkout.exercises[props.exerciseIndex].sets[setIndex].weight = newWeight
    setIndex++
    while (setIndex < newWorkout.exercises[props.exerciseIndex].sets.length) {
      if (!newWorkout.exercises[props.exerciseIndex].sets[setIndex].reps) {
        newWorkout.exercises[props.exerciseIndex].sets[setIndex].weight = newWeight
      }
      setIndex++
    }
    props.setWorkout(newWorkout)
    props.setPendingUpdates(prev => [...prev, newWorkout]);
}
const decreaseWeightForIndex = (props: ExerciseProps, setIndex: number) => () => {
    const newWorkout = JSON.parse(JSON.stringify(props.workout))
    const newWeight = newWorkout.exercises[props.exerciseIndex].sets[setIndex].weight - props.increment
    newWorkout.exercises[props.exerciseIndex].sets[setIndex].weight = newWeight
    setIndex++
    while (setIndex < newWorkout.exercises[props.exerciseIndex].sets.length) {
      if (!newWorkout.exercises[props.exerciseIndex].sets[setIndex].reps) {
        newWorkout.exercises[props.exerciseIndex].sets[setIndex].weight = newWeight
      }
      setIndex++
    }
    props.setWorkout(newWorkout)
    props.setPendingUpdates(prev => [...prev, newWorkout]);
}

const deleteExercise = (props: ExerciseProps) => {
    props.workout.exercises.splice(props.exerciseIndex, 1)
    props.setWorkout(props.workout)
    props.setPendingUpdates(prev => [...prev, props.workout]);
    props.template.exercises.splice(props.exerciseIndex, 1)
    props.setTemplate(props.template)
    props.setPendingTemplateUpdates(prev => [...prev, props.template])
    if (props.exerciseIndex >= props.workout.exercises.length) {
        props.setExerciseIndex(props.workout.exercises.length - 1)
    }
}

function getWeightsAsString(workout: WorkoutData, exerciseIndex: number): string {
    const weights = new Set(workout.exercises[exerciseIndex].sets.map((set: SetData) => set.weight))
    if (weights.size == 1) {
      return `${weights.values().next().value}` == "undefined" ? "" : `${weights.values().next().value}`
    }
    return workout.exercises[exerciseIndex].sets.filter((set) =>
      set.weight != undefined).map((set) =>
      set.weight?.toString()).join(", ");
}

  function getTargetsAsString(exercise: ExerciseData): string {
    const targets = new Set(exercise.sets.map((set: SetData) => set.target))
    if (targets.size == 1) {
      return `${targets.values().next().value}` == "undefined" ? "" : `${targets.values().next().value}`
    }
    return exercise.sets.filter((set) =>
      set.target != undefined).map((set) =>
      set.target?.toString()).join(", ");
}

function withoutReps(exercise: ExerciseData) {
for (var set of exercise.sets) {
    delete set.reps
}
return exercise
}
  

function setNumbers(sets: SetData[]) {
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

function reps(sets: SetData[], onRepsClick: (setIndex: number) => void) {
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

function xs(sets: SetData[]) {
    return (
        <vstack alignment="center middle" gap="small">
            <vstack height="16px"></vstack>
            {Array(sets.length).map((set) => <vstack cornerRadius="small" padding="small" width="25px" height="40px"><text size="xlarge" alignment='center middle'>x</text></vstack>)}
        </vstack>
    )
}

function weights(props: ExerciseProps, sets: SetData[]) {
    var weights = []
    for (let i = 0; i < sets.length; i++)  {
        if (sets[i].weight != undefined) {
            weights.push(<Weight weight={sets[i].weight} increaseWeight={() => increaseWeightForIndex(props, i)} decreaseWeight={() => decreaseWeightForIndex(props, i)}/>)
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

function summarizeExerciseTemplate(exercise: ExerciseData) {
  var comment = `${exercise.name} (`
  const setsAsStrings = exercise.sets.map((set) => `${set.target}`)
  if (new Set(setsAsStrings).size == 1)
  {
    comment += `${exercise.sets.length}x${setsAsStrings[0]}`
  } else {
    comment += setsAsStrings.join(", ")
  }
  return comment + ")";
}

export const Exercise = (props: ExerciseProps): JSX.Element => {
    const editForms = [...Array(props.workout.exercises.length).keys()].map((exerciseIndex) => useForm(
        (data) => ({
          fields: [
            {
              type: 'string',
              name: 'exerciseName',
              label: 'Exercise Name',
              required: true,
              defaultValue: data.workout.exercises[exerciseIndex].name
            },
            {
              type: 'image',
              name: 'image',
              label: 'Exercise Image (Leave blank to keep original)',
              required: false,
            },
            {
              type: 'number',
              name: 'sets',
              label: 'Number of Sets',
              required: true,
              defaultValue: data.workout.exercises[exerciseIndex].sets.length
            },
            {
              type: 'string',
              name: 'targets',
              label: 'Target reps per set (or comma-separated list of reps)',
              required: true,
              defaultValue: getTargetsAsString(data.workout[exerciseIndex])
            },
            {
              type: 'string',
              name: 'weights',
              label: 'Weight (or comma-separated list of weights)',
              required: false,
              defaultValue: getWeightsAsString(data.workout, exerciseIndex)
            },
           ],
           title: 'Edit this Exercise',
           acceptLabel: 'Edit',
        }), async (values) => {
          if (values.image == undefined) {
            values.image = props.workout.exercises[exerciseIndex].image
          }
          const newExercise = await createExerciseFromForm(values, props.context);
          props.workout.exercises[props.exerciseIndex] = newExercise
          props.setWorkout(props.workout)
          props.setPendingUpdates(prev => [...prev, props.workout]);
          props.template.exercises[exerciseIndex] = withoutReps(newExercise)
          props.setTemplate(props.template)
          props.setPendingTemplateUpdates(prev => [...prev, props.template])
    }));
    const editExercise = (props: ExerciseProps) => {
        props.context.ui.showForm(editForms[props.exerciseIndex], {workout: props.workout})
    }
    const exercise = props.workout.exercises[props.exerciseIndex]
    return (
        <vstack gap="medium">
            <vstack cornerRadius='large' height='100%' alignment='middle' onPress={() => editExercise(props)} grow><image url={exercise.image} width="280px" height={String(350 - exercise.sets.length * 50) + "px"} resizeMode='cover'></image></vstack>
            <hstack alignment="center top">
                <text size="xlarge" alignment="center top" onPress={props.editMode ? () => editExercise(props) : undefined}>{exercise.name}</text>
                {props.editMode ? <icon name="delete" onPress={() => deleteExercise(props)}/> : <hstack />}
            </hstack>
            <hstack alignment="center top" gap="small">
              {setNumbers(exercise.sets)}
              {reps(exercise.sets, props.onRepsClick)}
              {xs(exercise.sets)}
              {weights(props, exercise.sets)}
            </hstack>
        </vstack>
    )
}

export const ExerciseSummary = (props: ExerciseSummaryProps): JSX.Element => {
  return (
      <vstack height="100%" width="50%" grow gap="small">
          <vstack cornerRadius='large' alignment='middle' grow><image url={props.exercise.image}  imageWidth={960} imageHeight={540} resizeMode='cover' grow></image></vstack>
          <text size="large" alignment="center top">{summarizeExerciseTemplate(props.exercise)}</text>
      </vstack>
  )
}