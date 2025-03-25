import { Devvit, StateSetter, useAsync, useState } from "@devvit/public-api"
import { ExerciseData, loadingWorkout, SetData, WorkoutData } from "../types.js"
import { setTimes } from "./timer.js"
import { millisToString, totalDuration } from "../utils.js"
import { keyForWorkout } from "../keys.js"
import { asyncMap } from "../utils.js"

interface StatsProps {
    workout: WorkoutData
    workouts: {member: string; score: number;}[]
    showStats: boolean
    setShowStats: StateSetter<boolean>
    context: Devvit.Context
}

function shallowFlattenJson<T extends Record<string, any>>(obj: T): Record<string, any> {
    let flatObj: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
                flatObj[`${key} ${nestedKey}`] = nestedValue; // Join keys with a space
            }
        } else {
            flatObj[key] = value; // Keep top-level non-object values unchanged
        }
    }

    return flatObj;
}

export const Stats = (props: StatsProps): JSX.Element => {
    const [statIndex, setStatIndex] = useState(0)
    if (!props.showStats) {
        return <vstack />
    }
    const {data, loading, error} = useAsync(async () => {
        const allWorkouts: WorkoutData[] = await asyncMap(props.workouts, async workout => JSON.parse(await props.context.redis.get(keyForWorkout(workout.member, props.context.userId!)) ?? JSON.stringify(loadingWorkout)))
        const allExercises: ExerciseData[] = allWorkouts.flatMap(workout => workout.exercises)
        var statsByExercise: Record<string, Record<string, number[]>> = {}
        for (const currentExercise of props.workout.exercises) {
            const sameExercises = allExercises.filter(exercise => exercise.name == currentExercise.name)
            const stats = {
                "Max Weight": sameExercises.map(exercise => Math.max(...exercise.sets.filter(set => set.reps || set.targetTime).map(set => set.weight ?? 0))).filter(s => s !== null && s > 0),
                "Total Reps": sameExercises.map(exercise => exercise.sets.map(set => set.reps ?? 0).reduce((total, reps) => total + reps, 0)).filter(s =>  s !== null && s > 0),
                "Total Seconds": sameExercises.map(exercise => exercise.sets.map(set => set.time ?? 0).reduce((total, time) => total + Math.floor(time/1000), 0)).filter(s => s !== null && s > 0)
            };
            const interestingStats = Object.fromEntries(
                Object.entries(stats).filter(([_, values]) => new Set(values).size > 1)
            );
            if (Object.keys(interestingStats).length > 0) {
                statsByExercise[currentExercise.name] = {};
                Object.assign(statsByExercise[currentExercise.name], interestingStats);
            }        
        }
        return statsByExercise
    }, {
        depends: [props.context.userId!, props.workout.exercises.map(exercise => exercise.name)],
    });
    if (loading) {
        return <text>Computing Stats...</text>;
    }
    if (error) {
        return <text>Error: {error.message}</text>;
    }
    const labelToStats = shallowFlattenJson(data)
    const label = Object.keys(labelToStats)[statIndex]
    const statCount = Object.keys(labelToStats).length
    if (statCount == 0) {
        return (
            <zstack alignment="center middle" height="100%" width="100%">
                <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => props.setShowStats(false)} />
                <vstack alignment="center middle" height="100%" width="100%">
                    <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="center middle" padding="medium" cornerRadius="medium">
                        <text wrap>Repeat an exercise with more weight, more reps, or for a longer time to unlock Progress graphs!</text>
                    </vstack>
                </vstack>
           </zstack>)
    }
    // return <text>{data.squat}</text>
    const svgWidth = (props.context.dimensions?.width ?? 400) * 0.8 ;
    const svgHeight = (props.context.dimensions?.height ?? 300) * 0.8 ;;
    const padding = 40;
    const values = labelToStats[label]
    // Normalize Y values
    const maxY = Math.max(...values);
    const minY = Math.min(...values);
    const scaleX = (svgWidth - 2 * padding) / (values.length - 1);
    const scaleY = (svgHeight - 2 * padding) / (maxY - minY);
    
    // Convert data to SVG path
    const points = values.map((val, i) => {
        const x = padding + i * scaleX;
        const y = svgHeight - padding - (val - minY) * scaleY;
        return `${x},${y}`;
    });

    const gridLines = [];
    for (let yValue = minY; yValue <= maxY; yValue += 10) {
        const y = svgHeight - padding - (yValue - minY) * scaleY;
        gridLines.push(`<line x1="${padding}" y1="${y}" x2="${svgWidth - padding}" y2="${y}" stroke="#ccc" strokeWidth="1" />
            <text x="${padding - 25}" y="${y + 4}" fontSize="12" textAnchor="end" fill="#ccc">${yValue}</text>`);
    }
    
    const pathData = `M ${points.join(" L ")}`;
    return (
        <zstack alignment="center middle" height="100%" width="100%">
            <vstack alignment="center middle" height="100%" width="100%" lightBackgroundColor="rgba(64, 64, 64, 0.3)" darkBackgroundColor="rgba(0, 0, 0, 0.5)" onPress={() => props.setShowStats(false)} />
            <vstack alignment="center middle" height="100%" width="100%">
                <vstack lightBackgroundColor="white" darkBackgroundColor="neutral-background-strong" alignment="center middle" padding="medium" cornerRadius="medium">
                    <hstack width="100%">
                        <button icon="caret-left" onPress={() => setStatIndex((statIndex - 1) % statCount)}/>
                        <spacer grow />
                        <text size="xlarge">{label}</text>
                        <spacer grow />
                        <button icon="caret-right" onPress={() => setStatIndex((statIndex + 1) % statCount)}/>
                    </hstack>
                    <image
                        url={`data:image/svg+xml,<svg width="${svgWidth}" height="${svgHeight}">
                            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="#ccc" strokeWidth="2" />
                            <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="#ccc" strokeWidth="2" />
                            ${gridLines.join("")}
                            <path d="${pathData}" fill="none" stroke="blue" strokeWidth="2" />
                            ${points.map((point, index) => {
                                const [x, y] = point.split(",");
                                return `<circle key="${index}" cx="${x}" cy="${y}" r="4" fill="red" />`;
                                }).join("")}
                        </svg>`}
           imageHeight={svgHeight}
           imageWidth={svgWidth}
                 />
                </vstack>
            </vstack>
        </zstack>
    )
}