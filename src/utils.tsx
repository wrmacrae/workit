import { ExerciseData, SetData, WorkoutData } from './types.js';

export async function asyncMap<T, U>(
    array: T[],
    callback: (item: T, index: number, array: T[]) => Promise<U>): Promise<U[]> {
    return Promise.all(array.map(callback));
}

export function formatExerciseAsComment(exercise: ExerciseData) {
  var comment = `${exercise.name}: `;
  const sets: SetData[] = exercise.sets.filter((set: SetData) => set.reps || set.time);
  const setsAsStrings = sets.map((set: SetData) => `${set.reps || millisToString(set.time!)}` + (set.weight ? ` at ${set.weight}` : ``));
  if (new Set(setsAsStrings).size == 1 && sets.length > 1) {
    comment += `${setsAsStrings.length}x${sets[0].reps || millisToString(sets[0].time!)}` + (sets[0].weight ? ` at ${sets[0].weight}` : ``);
  } else {
    comment += setsAsStrings.join(", ");
  }
  return comment;
}

export function formatWorkoutAsComment(workout: WorkoutData) {
    return workout.exercises.filter((exercise: ExerciseData) => !exercise.sets.every((set: SetData) => !set.reps && !set.time)).map(formatExerciseAsComment).join("\n\n");
}

export function totalDuration(times: number[]) {
    return Math.max(...times) - Math.min(...times)
}

export function millisToString(time: number) {
    const date = new Date(Date.UTC(0, 0, 0, 0, 0, 0, time))
    var parts = [
        Math.floor(time / 3600000),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    ]
    if (parts[0] == 0) {
        parts.splice(0, 1)
    }
    return parts.map((s, i) => i > 0 ? String(s).padStart(2, '0') : s).join(':')
}