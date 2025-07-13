import { getClientIdFromUrl } from "./utils";

export interface WorkoutProgressStorage {
  completedSets: { [blockId: string]: number };
  exerciseCompletionInCurrentSet: { [blockExerciseId: string]: boolean };
}

const getLocalStorageKey = (workoutId: string): string => {
	return `workoutProgress_${workoutId}_${getClientIdFromUrl()}`;
};

/**
 * Loads progress for all exercises in a given workout and client.
 */
export const loadWorkoutProgressFromStorage = (workoutId?: string): WorkoutProgressStorage => {
	if (!workoutId) return { completedSets: {}, exerciseCompletionInCurrentSet: {} };
	const key = getLocalStorageKey(workoutId);
	try {
		const storedProgress = localStorage.getItem(key);
		if (storedProgress) {
			const data = JSON.parse(storedProgress);
			// ensure both keys exist
			return {
				completedSets: data.completedSets || {},
				exerciseCompletionInCurrentSet: data.exerciseCompletionInCurrentSet || {}
			};
		}
		return { completedSets: {}, exerciseCompletionInCurrentSet: {} };
	} catch (error) {
		console.error("Error loading progress from local storage:", error);
		return { completedSets: {}, exerciseCompletionInCurrentSet: {} };
	}
};

/**
 * Saves progress for a single exercise within a workout and client.
 */
export const saveWorkoutProgressToStorage = (
	workoutId: string,
	progress: Partial<WorkoutProgressStorage>,
): void => {
	if (!workoutId) return;
	const key = getLocalStorageKey(workoutId);
	try {
		const currentWorkoutProgress = loadWorkoutProgressFromStorage(workoutId);
		const updatedWorkoutProgress: WorkoutProgressStorage = {
			...currentWorkoutProgress,
			...progress,
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