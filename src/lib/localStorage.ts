export interface ExerciseProgress {
  currentSet: number;
  isExerciseDone: boolean;
  // We could add repsCompleted for each set here if we want to persist rep-level progress
  // For now, we only persist currentSet and overall completion of the exercise.
}

interface WorkoutProgressStorage {
  [blockExerciseId: string]: ExerciseProgress;
}

const getLocalStorageKey = (workoutId: string, clientId: string): string => {
	return `workoutProgress_${workoutId}_${clientId}`;
};

/**
 * Loads progress for all exercises in a given workout and client.
 */
export const loadWorkoutProgressFromStorage = (
	workoutId: string,
	clientId: string,
): WorkoutProgressStorage => {
	if (!workoutId || !clientId) return {};
	const key = getLocalStorageKey(workoutId, clientId);
	try {
		const storedProgress = localStorage.getItem(key);
		return storedProgress ? JSON.parse(storedProgress) : {};
	} catch (error) {
		console.error("Error loading progress from local storage:", error);
		return {};
	}
};

/**
 * Saves progress for a single exercise within a workout and client.
 */
export const saveExerciseProgressToStorage = (
	workoutId: string,
	clientId: string,
	blockExerciseId: string,
	progress: ExerciseProgress,
): void => {
	if (!workoutId || !clientId || !blockExerciseId) return;
	const key = getLocalStorageKey(workoutId, clientId);
	try {
		const currentWorkoutProgress = loadWorkoutProgressFromStorage(workoutId, clientId);
		const updatedWorkoutProgress: WorkoutProgressStorage = {
			...currentWorkoutProgress,
			[blockExerciseId]: progress,
		};
		localStorage.setItem(key, JSON.stringify(updatedWorkoutProgress));
	} catch (error) {
		console.error("Error saving progress to local storage:", error);
	}
};

/**
 * Clears all progress for a given workout and client.
 */
export const clearWorkoutProgressInStorage = (
	workoutId: string,
	clientId: string,
): void => {
	if (!workoutId || !clientId) return;
	const key = getLocalStorageKey(workoutId, clientId);
	try {
		localStorage.removeItem(key);
		console.log(`Cleared progress for workout ${workoutId}, client ${clientId}`);
	} catch (error) {
		console.error("Error clearing progress from local storage:", error);
	}
}; 