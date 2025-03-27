export function keyForWorkout(postId: string, userId: string) {
  return `workout-for-post-${postId}-for-user-${userId}`;
}
export function keyForTemplate(postId: string) {
  return `template-for-post-${postId}`;
}
export function keyForExerciseCollection(userId: string) {
  return `exercise-collection-for-user-${userId}`;
}
export function keyForSettings(userId: string) {
  return `settings-for-user-${userId}`;
}
export function keyForExerciseToLastCompletion(userId: string) {
  return `exercise-to-last-completion-for-user-${userId}`;
}
export function keyForUsersByLastCompletion() {
  return `users-by-last-completion`
}
export function keyForAllWorkouts(userId: string) {
  return `all-workouts-for-user-${userId}`;
}
