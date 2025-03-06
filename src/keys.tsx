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
//TODO: Store this stuff
export function keyForAllWorkouts(userId: string) {
  return `all-workouts-for-user-${userId}`;
}
//TODO: Store this stuff
export function keyForAllTemplates(userId: string) {
  return `all-templates-for-user-${userId}`;
}
