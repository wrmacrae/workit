import { Devvit, useForm } from '@devvit/public-api';
import { ExerciseData } from '../types.js';
import { createExerciseFromForm, makeWorkitPost } from '../main.js';

interface MenuProps {
    settings: () => void
    returnToSummary: () => void
    setShowMenu: (showMenu: boolean) => void
    showMenu: boolean
    resetWorkout: () => void
    isAuthor: boolean
    toggleEditMode: () => void
    editMode: boolean
    context: Devvit.Context
    exerciseCollection: { [k: string]: ExerciseData }
}

export const Menu = (props: MenuProps): JSX.Element => {
    const exerciseForm = useForm(
        {
          fields: [
            {
              type: 'string',
              name: 'exerciseName',
              label: 'Exercise Name',
              required: true,
            },
            {
              type: 'image',
              name: 'image',
              label: 'Exercise Image',
              required: true,
            },
            {
              type: 'number',
              name: 'sets',
              label: 'Number of Sets',
              required: true,
            },
            {
              type: 'string',
              name: 'targets',
              label: 'Target reps per set (or comma-separated list of reps)',
              required: true,
            },
            {
              type: 'string',
              name: 'weights',
              label: 'Weight (or comma-separated list of weights)',
              required: false,
            },
           ],
           title: 'Create a New Exercise',
           acceptLabel: 'Save to Collection',
        }, async (values) => {
          await createExerciseFromForm(values, props.context);
        }
    );
    const options = Object.keys(props.exerciseCollection).sort().map(exercise => ({ label: exercise, value: exercise }))
    const requiredExerciseFields = [
        {
            type: 'string',
            name: 'title',
            label: 'Workout Title',
            required: true,
        },
        {
            type: 'select',
            name: 'exercise0',
            label: 'Exercise 1',
            required: true,
            options: options
        }]
    const optionalExerciseFields = [...Array(7).keys()].map((_, index) => ({
        type: 'select',
        name: 'exercise' + (index+1).toString(),
        label: 'Exercise' + (index+2).toString(),
        required: false,
        options: options
    }));
    const workoutForm = useForm(
        {
           fields: requiredExerciseFields.concat(optionalExerciseFields),
           title: 'Create a New Workout',
           acceptLabel: 'Post Workout',
        }, async (values) => {
          const { title, exercise0, exercise1, exercise2, exercise3, exercise4, exercise5, exercise6, exercise7, exercise8, exercise9 } = values
          const exercises = exercise0.concat(exercise1, exercise2, exercise3, exercise4, exercise5, exercise6, exercise7, exercise8, exercise9).filter((exercise: ExerciseData) => exercise != null).map((exercise: ExerciseData) => props.exerciseCollection[exercise])
          await makeWorkitPost(props.context, title, {exercises: exercises})
        }
      );
    return (<vstack padding="small" gap="small">
    <button onPress={() => props.setShowMenu(!props.showMenu)} icon={props.showMenu ? "close" : "menu-fill"}></button>
    {props.showMenu ?
      <vstack darkBackgroundColor='rgb(26, 40, 45)' lightBackgroundColor='rgb(234, 237, 239)' cornerRadius='medium'>
        <hstack padding="small" onPress={props.resetWorkout}><spacer/><icon lightColor='black' darkColor='white' name="delete" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Reset Workout</text><spacer/></hstack>
        <hstack padding="small" onPress={props.returnToSummary}><spacer/><icon lightColor='black' darkColor='white' name="refresh" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Return to Intro Summary</text><spacer/></hstack>
        <hstack padding="small" onPress={props.settings}><spacer/><icon lightColor='black' darkColor='white' name="settings" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Settings</text><spacer/></hstack>
        <hstack padding="small" onPress={() => props.context.ui.showForm(exerciseForm)}><spacer/><icon lightColor='black' darkColor='white' name="add" /><spacer/><text lightColor='black' darkColor='white' weight="bold">New Exercise</text><spacer/></hstack>
        <hstack padding="small" onPress={() => props.context.ui.showForm(workoutForm)}><spacer/><icon lightColor='black' darkColor='white' name="text-post" /><spacer/><text lightColor='black' darkColor='white' weight="bold">New Workout</text><spacer/></hstack>
        {/* <hstack padding="small" onPress={() => console.log("not yet implemented")}><spacer/><icon lightColor='black' darkColor='white' name="settings" /><spacer/><text lightColor='black' darkColor='white' weight="bold">Settings</text><spacer/></hstack> */}
        {props.isAuthor ?
        <hstack padding="small" onPress={props.toggleEditMode}><spacer/><icon lightColor='black' darkColor='white' name={props.editMode ? "edit-fill": "edit"} /><spacer/><text lightColor='black' darkColor='white' weight="bold">{props.editMode ? "Dis" : "En"}able Edit Mode</text><spacer/></hstack>
        :<vstack/>}
      </vstack>
     : <vstack/> }
  </vstack>)
}