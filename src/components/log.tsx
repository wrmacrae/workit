import { Devvit, StateSetter, useAsync, useState } from "@devvit/public-api"
import { ExerciseData, loadingWorkout, SetData, WorkoutData } from "../types.js"
import { setTimes } from "./timer.js"
import { formatWorkoutAsComment, millisToString, totalDuration } from "../utils.js"
import { keyForWorkout } from "../keys.js"
import { asyncMap } from "../utils.js"

interface LogProps {
    workout: WorkoutData
    workouts: {member: string; score: number;}[]
    showLog: boolean
    setShowLog: StateSetter<boolean>
    context: Devvit.Context
}

export const Log = (props: LogProps): JSX.Element => {
    const [page, setPage] = useState(0)
    if (!props.showLog) {
        return <vstack />
    }
    const {data, loading, error} = useAsync(async () => {
        return await asyncMap(props.workouts, async workout => JSON.parse(await props.context.redis.get(keyForWorkout(workout.member, props.context.userId!)) ?? JSON.stringify(loadingWorkout)))
    }, {
        depends: [props.context.userId!, props.workout.complete ?? 0],
    });
    if (loading) {
        return <text>Computing Log...</text>;
    }
    if (error) {
        return <text>Error: {error.message}</text>;
    }
    const validWorkouts: WorkoutData[] = data?.filter(workout => workout.complete)
    const workoutDates = validWorkouts.map(workout => (new Date(workout.complete ?? 0)).toLocaleDateString(navigator.language, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }))
    const workoutLines = validWorkouts.map(workout => formatWorkoutAsComment(workout).split("\n\n"))
    var pages: string[][] = [[]]
    const LINES_PER_PAGE = 21
    for (let i = 0; i < workoutDates.length; i++) {
        if (pages.slice(-1)[0].length + workoutLines[i].length + 2 > LINES_PER_PAGE) {
            pages.push([])
        }
        pages.slice(-1)[0].push(workoutDates[i])
        pages.slice(-1)[0].push(...workoutLines[i])
        pages.slice(-1)[0].push("")
    }
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => props.setShowLog(false)} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="start top" padding="medium" cornerRadius="medium">
                    <hstack width="100%" alignment="center middle">
                        {page > 0 ? <button icon="caret-left" onPress={() => setPage(page - 1)}/> : <vstack width="40px" height="40px" />}
                        <spacer grow />
                        <text size="xlarge">Page {page + 1}</text>
                        <spacer grow />
                        {page < pages.length - 1 ? <button icon="caret-right" onPress={() => setPage(page + 1)}/> : <vstack width="40px" height="40px" />}
                    </hstack>
                    {pages[page].map(line => line.length ? <text>{line}</text> : <spacer />)}
                </vstack>
            </vstack>
        </zstack>
    )
}