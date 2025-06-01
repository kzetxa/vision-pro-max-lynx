import { getClientIdFromUrl } from "./utils";

export interface ExerciseProgress {
  currentSet: number;
  isExerciseDone: boolean;
  // We could add repsCompleted for each set here if we want to persist rep-level progress
  // For now, we only persist currentSet and overall completion of the exercise.
}

interface WorkoutProgressStorage {
  [blockExerciseId: string]: ExerciseProgress;
}

const getLocalStorageKey = (workoutId: string): string => {
	return `workoutProgress_${workoutId}_${getClientIdFromUrl()}`;
};

/**
 * Loads progress for all exercises in a given workout and client.
 */
export const loadWorkoutProgressFromStorage = (workoutId?: string): WorkoutProgressStorage => {
	if (!workoutId) return {};
	const key = getLocalStorageKey(workoutId);
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
	blockExerciseId: string,
	progress: ExerciseProgress,
): void => {
	if (!workoutId || !blockExerciseId) return;
	const key = getLocalStorageKey(workoutId);
	try {
		const currentWorkoutProgress = loadWorkoutProgressFromStorage(workoutId);
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
export const clearWorkoutProgressInStorage = (workoutId: string): void => {
	if (!workoutId) return;
	const key = getLocalStorageKey(workoutId);
	try {
		localStorage.removeItem(key);
		console.log(`Cleared progress for workout ${workoutId}, client ${getClientIdFromUrl()}`);
	} catch (error) {
		console.error("Error clearing progress from local storage:", error);
	}
}; 