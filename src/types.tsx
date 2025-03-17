export type SetData = {
  target?: number;
  weight?: number;
  reps?: number;
  repsEnteredTime?: number;
};
export type ExerciseData = {
  name: string;
  image: string;
  superset?: boolean;
  sets: SetData[];
};
export type WorkoutData = {
  title?: string;
  complete?: number;
  author?: string;
  exercises: ExerciseData[];
  optionalExercises?: ExerciseData[];
};
export const loadingWorkout: WorkoutData = {
  exercises: []
};
export type SettingsData = {
  increment: number
  barbellWeight: number
  notifications: boolean
}