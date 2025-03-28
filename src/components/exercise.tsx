import { Devvit, JSONArray, SetStateAction, StateSetter, useForm } from '@devvit/public-api';
import { DisabledWeight, Weight } from './weight.js';
import { Reps } from './reps.js';
import { SetNumber } from './setnumber.js';
import { ExerciseData, SetData, WorkoutData } from '../types.js';
import { createExerciseFromForm } from '../main.js';

interface ExerciseSummaryProps {
    exercise: ExerciseData
    supersetGrid: ExerciseData[][]
}

interface ExerciseProps {
    exerciseIndex: number
    increment: number
    editMode: boolean
    context: Devvit.Context
    setWorkout: (value: SetStateAction<WorkoutData>) => void
    workout: WorkoutData
    setTemplate: (value: SetStateAction<WorkoutData>) => void
    template: WorkoutData
    setPendingUpdates: StateSetter<never[]>
    setPendingTemplateUpdates: StateSetter<never[]>
    setExerciseIndex: StateSetter<number>
    plateCalculatorIndices: number[]
    setPlateCalculatorIndices: StateSetter<number[]>
    setShowExerciseInfo: StateSetter<ExerciseData[]>
}

function saveWorkout(props: ExerciseProps) {
  props.setWorkout(props.workout);
  props.setPendingUpdates(prev => [...prev, props.workout]);
}

const increaseWeightForIndex = (props: ExerciseProps, setIndex: number) => () => {
    const newWeight = Number(props.workout.exercises[props.exerciseIndex].sets[setIndex].weight) + props.increment
    props.workout.exercises[props.exerciseIndex].sets[setIndex].weight = newWeight
    for (var set = setIndex + 1; set < props.workout.exercises[props.exerciseIndex].sets.length; set++) {
      if (!props.workout.exercises[props.exerciseIndex].sets[set].reps && !props.workout.exercises[props.exerciseIndex].sets[set].time) {
        props.workout.exercises[props.exerciseIndex].sets[set].weight = newWeight
      }
    }
    saveWorkout(props);
}
const decreaseWeightForIndex = (props: ExerciseProps, setIndex: number) => () => {
    const newWeight = Number(props.workout.exercises[props.exerciseIndex].sets[setIndex].weight) - props.increment
    props.workout.exercises[props.exerciseIndex].sets[setIndex].weight = newWeight
    setIndex++
    while (setIndex < props.workout.exercises[props.exerciseIndex].sets.length) {
      if (!props.workout.exercises[props.exerciseIndex].sets[setIndex].reps && !props.workout.exercises[props.exerciseIndex].sets[setIndex].time) {
        props.workout.exercises[props.exerciseIndex].sets[setIndex].weight = newWeight
      }
      setIndex++
    }
    saveWorkout(props);
}

const setRepsToTarget = (props: ExerciseProps, setIndex: number) => {
  props.workout.exercises[props.exerciseIndex].sets[setIndex].reps = props.workout.exercises[props.exerciseIndex].sets[setIndex].target
  props.workout.exercises[props.exerciseIndex].sets[setIndex].repsEnteredTime = Date.now()
  saveWorkout(props);
}
const increaseRepsForIndex = (props: ExerciseProps, setIndex: number) => () => {
  props.workout.exercises[props.exerciseIndex].sets[setIndex].reps = props.workout.exercises[props.exerciseIndex].sets[setIndex].reps! + 1
  props.workout.exercises[props.exerciseIndex].sets[setIndex].repsEnteredTime = Date.now()
  saveWorkout(props);
}
const decreaseRepsForIndex = (props: ExerciseProps, setIndex: number) => () => {
  props.workout.exercises[props.exerciseIndex].sets[setIndex].reps = props.workout.exercises[props.exerciseIndex].sets[setIndex].reps! - 1
  props.workout.exercises[props.exerciseIndex].sets[setIndex].repsEnteredTime = Date.now()
  saveWorkout(props);
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

function withoutRepsOrTime(exercise: ExerciseData) {
for (var set of exercise.sets) {
    delete set.reps
    delete set.time
    delete set.repsEnteredTime
}
return exercise
}

function setNumbers(sets: SetData[], onRepsClick: (setIndex: number) => void) {
    var setNumbers = []
    for (let i = 0; i < sets.length; i++)  {
        setNumbers.push(<SetNumber setNumber={i+1} done={Boolean(sets[i].reps || sets[i].time)} onPress={() => onRepsClick(i)} />)    
    }
    return (
        <vstack alignment="center top" gap="small">
            <text size="small" alignment='center middle'>Set</text>
            {setNumbers}
        </vstack>
    )
}

function reps(props: ExerciseProps, sets: SetData[], onRepsClick: (setIndex: number) => void) {
    var reps = []
    const nextIndex = sets.findIndex((set: SetData) => !set.reps && !set.time)
    for (let i = 0; i < sets.length; i++)  {
        reps.push(<Reps workout={props.workout} exerciseIndex={props.exerciseIndex} setIndex={i} set={sets[i]} primary={i==nextIndex} onPress={() => onRepsClick(i)} increaseReps={increaseRepsForIndex(props, i)} decreaseReps={decreaseRepsForIndex(props, i)} setWorkout={props.setWorkout} setPendingUpdates={props.setPendingUpdates}/>)
    }
    return (
        <vstack alignment="center top" gap="small">
            <text size="small" alignment='center middle'>{sets[0].target ? "Reps" : "Time"}</text>
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
  if (sets.every(set => set.weight == undefined)) {
    return (<vstack />)
  }  
  var weights = []
  for (let i = 0; i < sets.length; i++)  {
      if (sets[i].weight != undefined) {
          weights.push(<Weight weight={sets[i].weight} increaseWeight={increaseWeightForIndex(props, i)} decreaseWeight={decreaseWeightForIndex(props, i)} onPress={() => props.setPlateCalculatorIndices([props.exerciseIndex, i])}/>)
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
  const setsAsStrings = exercise.sets.map((set) => `${set.target || `${set.targetTime!/1000}sec`}`)
  if (new Set(setsAsStrings).size == 1)
  {
    comment += `${exercise.sets.length}x${setsAsStrings[0]}`
  } else {
    comment += setsAsStrings.join(", ")
  }
  return comment + ")";
}

export const Exercise = (props: ExerciseProps): JSX.Element => {

    const onRepsClick = (setIndex: number) => {
      setRepsToTarget(props, setIndex)
    }

    const editForm = useForm({
          fields: [
            {
              type: 'string',
              name: 'exerciseName',
              label: 'Exercise Name',
              required: true,
              defaultValue: props.workout.exercises[props.exerciseIndex].name
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
              defaultValue: props.workout.exercises[props.exerciseIndex].sets.length
            },
            {
              type: 'string',
              name: 'targets',
              label: 'Target reps per set (or comma-separated list of reps)',
              required: true,
              defaultValue: getTargetsAsString(props.workout.exercises[props.exerciseIndex])
            },
            {
              type: 'string',
              name: 'weights',
              label: 'Weight (or comma-separated list of weights)',
              required: false,
              defaultValue: getWeightsAsString(props.workout, props.exerciseIndex)
            },
           ],
           title: 'Edit this Exercise',
           acceptLabel: 'Edit',
        }, async (values) => {
          if (values.image == undefined) {
            values.image = props.workout.exercises[props.exerciseIndex].image
          }
          const newExercise = await createExerciseFromForm(values, props.context);
          props.workout.exercises[props.exerciseIndex] = newExercise
          props.setWorkout(props.workout)
          props.setPendingUpdates(prev => [...prev, props.workout]);
          props.template.exercises[props.exerciseIndex] = withoutRepsOrTime(newExercise)
          props.setTemplate(props.template)
          props.setPendingTemplateUpdates(prev => [...prev, props.template])
    });
    const editExercise = (props: ExerciseProps) => {
        props.context.ui.showForm(editForm)
    }
    const exercise = props.workout.exercises[props.exerciseIndex]
    return (
        <vstack gap="small">
            <vstack cornerRadius='large' height='100%' alignment='middle' onPress={props.editMode ? () => editExercise(props) : undefined} grow><image url={exercise.image} imageWidth={960} imageHeight={540} width="280px" height={String(350 - exercise.sets.length * 50) + "px"} resizeMode='cover'></image></vstack>
            <zstack width="100%">
              <hstack width="100%" alignment="center top">
                  <text size="large" alignment="center top" onPress={props.editMode ? () => editExercise(props) : undefined}>{exercise.name}</text>
                  {props.editMode ? <icon name="delete" onPress={() => deleteExercise(props)}/> : <hstack />}
              </hstack>
              <hstack width="100%" alignment="end top">
                {props.workout.exercises[props.exerciseIndex].info ? 
                  <icon name="info" onPress={() => props.setShowExerciseInfo([props.workout.exercises[props.exerciseIndex]])} /> :
                  <vstack />
                }
              </hstack>
            </zstack>
            <hstack alignment="center middle" gap="small">
              {setNumbers(exercise.sets, onRepsClick)}
              {reps(props, exercise.sets, onRepsClick)}
              {weights(props, exercise.sets)}
            </hstack>
        </vstack>
    )
}

function widthOfSupersets(supersetGrid: ExerciseData[][]) {
  return Math.max(...supersetGrid.map((row: ExerciseData[]) => row.length))
}

export const ExerciseSummary = (props: ExerciseSummaryProps): JSX.Element => {

  return (
      <vstack height="100%" width="100%" grow gap="small">
          <vstack cornerRadius='large' alignment='middle center' grow><image url={props.exercise.image}  imageWidth={960} imageHeight={540} width={"100%"} height={"100%"} resizeMode='cover' grow></image></vstack>
          <text size="large" alignment="center top">{summarizeExerciseTemplate(props.exercise)}</text>
      </vstack>
  )
}
