import { Devvit, StateSetter } from "@devvit/public-api"
import { ExerciseData } from "../types.js"
import { ExerciseSummary } from "./exercise.js"

interface SummaryProps {
    supersetGrid: ExerciseData[][]
    setSummaryMode: StateSetter<boolean>
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
    return(<zstack height="100%" width="100%" alignment="center middle">
        <vstack grow height="100%" width="100%" alignment="center middle" gap="medium" padding='small' onPress={() => props.setSummaryMode(false)}>
          {props.supersetGrid.map((row) => <hstack grow width="100%" alignment="center middle" gap="small">{row.map((exercise: ExerciseData) => <ExerciseSummary exercise={exercise} supersetGrid={props.supersetGrid} />)}</hstack>)}
        </vstack>
        <vstack width="100%" height="100%" onPress={() => props.setSummaryMode(false)}></vstack> :
        <button appearance="primary" onPress={() => props.setSummaryMode(false)}>Do This Workout!</button>
      </zstack>)    
}