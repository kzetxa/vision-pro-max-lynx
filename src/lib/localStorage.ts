import { getClientIdFromUrl } from "./utils";

export interface WorkoutProgressStorage {
  completedSets: { [blockId: string]: number };
  exerciseCompletionInCurrentSet: { [blockExerciseId: string]: boolean };
  specialSetProgress: { [specialSetName: string]: number };
  specialSetCurrentRoundIndex: { [specialSetName: string]: number };
}

// Language storage constants
const LANGUAGE_STORAGE_KEY = 'selectedVoiceLanguage';

const getLocalStorageKey = (workoutId: string): string => {
	return `workoutProgress_${workoutId}_${getClientIdFromUrl()}`;
};

/**
 * Loads progress for all exercises in a given workout and client.
 */
export const loadWorkoutProgressFromStorage = (workoutId?: string): WorkoutProgressStorage => {
	if (!workoutId) return { 
		completedSets: {}, 
		exerciseCompletionInCurrentSet: {},
		specialSetProgress: {},
		specialSetCurrentRoundIndex: {}
	};
	const key = getLocalStorageKey(workoutId);
	try {
		const storedProgress = localStorage.getItem(key);
		if (storedProgress) {
			const data = JSON.parse(storedProgress);
			// ensure all keys exist
			return {
				completedSets: data.completedSets || {},
				exerciseCompletionInCurrentSet: data.exerciseCompletionInCurrentSet || {},
				specialSetProgress: data.specialSetProgress || {},
				specialSetCurrentRoundIndex: data.specialSetCurrentRoundIndex || {}
			};
		}
		return { 
			completedSets: {}, 
			exerciseCompletionInCurrentSet: {},
			specialSetProgress: {},
			specialSetCurrentRoundIndex: {}
		};
	} catch (error) {
		console.error("Error loading progress from local storage:", error);
		return { 
			completedSets: {}, 
			exerciseCompletionInCurrentSet: {},
			specialSetProgress: {},
			specialSetCurrentRoundIndex: {}
		};
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

/**
 * Loads the selected voice language from local storage.
 * Returns 'en' (English) as default if no language is stored.
 */
export const loadSelectedLanguageFromStorage = (): string => {
	try {
		const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
		return storedLanguage || 'en';
	} catch (error) {
		console.error("Error loading language from local storage:", error);
		return 'en';
	}
};

/**
 * Saves the selected voice language to local storage.
 */
export const saveSelectedLanguageToStorage = (language: string): void => {
	try {
		localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
	} catch (error) {
		console.error("Error saving language to local storage:", error);
	}
}; 