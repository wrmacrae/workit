import { Devvit, SetStateAction, StateSetter } from "@devvit/public-api"
import { ExerciseData, WorkoutData } from "../types.js"
import { ExerciseSummary } from "./exercise.js"
import { MiniMenu } from "./menu.js"
import { MiniProgressBar } from "./progressbar.js"

interface SummaryProps {
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
    stats: () => void
    achievements: () => void
    log: () => void
    workout: WorkoutData
    supersetGrid: ExerciseData[][]
    setSummaryMode: StateSetter<boolean>
    supersetDoneness: boolean[][][]
    setExerciseIndex: StateSetter<number>
    exerciseIndex: number
    newPostUrls: string[]
    newWorkouts: WorkoutData[]
  }

function convertTo2DArray(array: any[]) {
    const result = [];
    for (let i = 0; i < array.length; i += 2) {
      result.push(array.slice(i, i + 2));
    }
    return result;
}
  
export const Summary = (props: SummaryProps): JSX.Element => {
    if (props.supersetGrid.every((row) => row.length <= 1) && props.supersetGrid.flat().length > 4) {
        props.supersetGrid = convertTo2DArray(props.supersetGrid.flat())
    }
    if (props.workout && props.workout.complete) {
      return (<hstack height="100%" width="100%" alignment="center middle">
        <vstack>
          <MiniMenu settings={props.settings} returnToSummary={props.returnToSummary} setShowMenu={props.setShowMenu} showMenu={props.showMenu} resetWorkout={props.resetWorkout} isAuthor={props.isAuthor} toggleEditMode={props.toggleEditMode} editMode={props.editMode} context={props.context} exerciseCollection={props.exerciseCollection} stats={props.stats} achievements={props.achievements} log={props.log} />
          <spacer grow />
          {props.newWorkouts ?
          <vstack alignment="center middle" gap="small" padding="small">
            <text size="large">Go To a New Workout:</text>
            {props.newWorkouts.map((workout, index) => <button onPress={() => props.context.ui.navigateTo(props.newPostUrls[index])}>{workout.title}</button>)}
          </vstack>
          : <vstack/>}
        </vstack>
        <spacer grow></spacer>
        <vstack grow height="100%" width="70%" alignment="center middle" gap="medium" padding='small' onPress={() => props.setSummaryMode(false)}>
          {props.supersetGrid.map((row) => <hstack grow width="100%" alignment="center middle" gap="small">{row.map((exercise: ExerciseData) => <ExerciseSummary exercise={exercise} supersetGrid={props.supersetGrid} />)}</hstack>)}
        </vstack>
        <spacer grow></spacer>
        <MiniProgressBar supersetDoneness={props.supersetDoneness} setExerciseIndex={props.setExerciseIndex} exerciseIndex={props.exerciseIndex} height="100%" setSummaryMode={props.setSummaryMode} />
      </hstack>)
    }
    if (!props.workout || !props.workout.exercises.length) {
      return (<hstack height="100%" width="100%" alignment="center middle">
          <MiniMenu settings={props.settings} returnToSummary={props.returnToSummary} setShowMenu={props.setShowMenu} showMenu={props.showMenu} resetWorkout={props.resetWorkout} isAuthor={props.isAuthor} toggleEditMode={props.toggleEditMode} editMode={props.editMode} context={props.context} exerciseCollection={props.exerciseCollection} stats={props.stats} achievements={props.achievements} log={props.log} />
          {props.newWorkouts ?
          <vstack alignment="center middle" gap="large" padding="small">
            {props.newWorkouts.map((workout, index) => <button icon="play" onPress={() => props.context.ui.navigateTo(props.newPostUrls[index])}>{workout.title}</button>)}
          </vstack>
          : <vstack/>}
      </hstack>)
    }
    return(<zstack height="100%" width="100%" alignment="center middle">
        <vstack grow height="100%" width="100%" alignment="center middle" gap="medium" padding='small' onPress={() => props.setSummaryMode(false)}>
          {props.supersetGrid.map((row) => <hstack grow width="100%" alignment="center middle" gap="small">{row.map((exercise: ExerciseData) => <ExerciseSummary exercise={exercise} supersetGrid={props.supersetGrid} />)}</hstack>)}
        </vstack>
        <vstack width="100%" height="100%" onPress={() => props.setSummaryMode(false)}></vstack> :
        <button appearance="primary" onPress={() => props.setSummaryMode(false)}>Do This Workout!</button>
      </zstack>)    
}