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
  complete?: number;
  author?: string;
  exercises: ExerciseData[];
};
export const loadingWorkout: WorkoutData = {
  exercises: []
};
