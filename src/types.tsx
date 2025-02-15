export type SetData = {
  target?: number;
  weight?: number;
  reps?: number;
};
export type ExerciseData = {
  name: string;
  image: string;
  superset?: boolean;
  sets: SetData[];
};
export type WorkoutData = {
  complete?: boolean;
  author?: string;
  exercises: ExerciseData[];
};
export const loadingWorkout: WorkoutData = {
  exercises: []
};
