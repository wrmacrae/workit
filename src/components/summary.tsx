import { Devvit, SetStateAction, StateSetter } from "@devvit/public-api"
import { ExerciseData, PostInfo, WorkoutData } from "../types.js"
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
    newPosts: PostInfo[]
  }

function convertTo2DArray(array: any[]) {
    const result = [];
    for (let i = 0; i < array.length; i += 2) {
      result.push(array.slice(i, i + 2));
    }
    return result;
}

function ago(time: number) {
  const diff = Date.now() - time
  if (diff < 60*1000) {
    return "<1 min. ago"
  } else if (diff < 60*60*1000) {
    return `${Math.floor(diff/60/1000)} min. ago`
  } else if (diff < 24*60*60*1000) {
    return `${Math.floor(diff/60/60/1000)} hr. ago`
  } else {
    return `${Math.floor(diff/24/60/60/1000)} days ago`
  }
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
          {props.newPosts ?
          <vstack alignment="center middle" gap="small" padding="small">
            {props.newPosts.map(post =>
                <vstack alignment="center middle">
                  <text size="small" color="neutral-content-weak">{ago(post.createdAt)}</text>
                  <button icon="play" onPress={() => props.context.ui.navigateTo(post.url)}>{post.workout.title}</button>
                </vstack>
              )}
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
      return (<zstack height="100%" width="100%" alignment="center middle">
        <image url="background.jpg" imageWidth={1334} imageHeight={749} height="100%" width="100%" resizeMode="cover"/>
        <hstack alignment="center middle" backgroundColor="neutral-background" cornerRadius="large" padding="large">
            <MiniMenu settings={props.settings} returnToSummary={props.returnToSummary} setShowMenu={props.setShowMenu} showMenu={props.showMenu} resetWorkout={props.resetWorkout} isAuthor={props.isAuthor} toggleEditMode={props.toggleEditMode} editMode={props.editMode} context={props.context} exerciseCollection={props.exerciseCollection} stats={props.stats} achievements={props.achievements} log={props.log} />
            {props.newPosts ?
            <vstack alignment="center middle" gap="small" padding="small">
              {props.newPosts.map(post =>
                <vstack alignment="center middle">
                  <text size="small" color="neutral-content-weak">{ago(post.createdAt)}</text>
                  <button icon="play" onPress={() => props.context.ui.navigateTo(post.url)}>{post.workout.title}</button>
                </vstack>
              )}
            </vstack>
            : <vstack/>}
        </hstack>
      </zstack>)
    }
    return(<zstack height="100%" width="100%" alignment="center middle">
        <vstack grow height="100%" width="100%" alignment="center middle" gap="medium" padding='small' onPress={() => props.setSummaryMode(false)}>
          {props.supersetGrid.map((row) => <hstack grow width="100%" alignment="center middle" gap="small">{row.map((exercise: ExerciseData) => <ExerciseSummary exercise={exercise} supersetGrid={props.supersetGrid} />)}</hstack>)}
        </vstack>
        <vstack width="100%" height="100%" onPress={() => props.setSummaryMode(false)}></vstack> :
        <button appearance="primary" onPress={() => props.setSummaryMode(false)}>Do This Workout!</button>
      </zstack>)    
}