import { makeObservable, observable, action, runInAction, computed } from "mobx";
import { fetchWorkoutDetailsById } from "../lib/api";
import type { SupabasePopulatedWorkout, SupabaseBlockExercise, SupabasePopulatedBlock, SupabaseExercise } from "../lib/types";
import {
	loadWorkoutProgressFromStorage,
	clearWorkoutProgressInStorage,
	saveExerciseProgressToStorage,
	type ExerciseProgress,
} from "../lib/localStorage";
import {
	parseSetsAndReps,
	getDisplayableArrayString,
} from "../lib/utils";
import type { RootStore } from "./RootStore";
import { getOrGenerateAudio } from "../lib/supabase";


export class WorkoutPageStore {
	rootStore: RootStore; // To access other stores if needed in the future
	workoutData: SupabasePopulatedWorkout | null = null;
	loading: boolean = true;
	error: string | null = null;
	isListView: boolean = false;
	isFinishDialogOpen: boolean = false;
	allExerciseProgress: {[blockExerciseId: string]: ExerciseProgress} = {};
	currentExerciseAudioUrl: string | null = null;
	isAudioLoading: boolean = false;

	// These will be set by an init method or passed if needed
	private currentWorkoutId: string | null = null;
	private currentClientId: string | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeObservable(this, {
			workoutData: observable,
			loading: observable,
			error: observable,
			isListView: observable,
			isFinishDialogOpen: observable,
			allExerciseProgress: observable.deep,
			currentExerciseAudioUrl: observable,
			isAudioLoading: observable,

			// Actions
			initializePage: action,
			toggleListView: action,
			openFinishDialog: action,
			closeFinishDialog: action,
			handleToggleExerciseCompleteList: action,
			handleFinishWorkout: action,
			fetchAndSetExerciseAudio: action,
			// Internal setters for state changes within async operations
			_setWorkoutData: action,
			_setLoading: action,
			_setError: action,
			_setAllExerciseProgress: action,
			_clearError: action,
			_setCurrentExerciseAudioUrl: action,
			_setAudioLoading: action,

			// Computed properties / getters
			getBlockExerciseById: computed,
			getExerciseById: computed,
			getExerciseProgressState: computed,
		});
	}

	_setWorkoutData(data: SupabasePopulatedWorkout | null): void {
		this.workoutData = data;
	}
	_setLoading(loading: boolean): void {
		this.loading = loading;
	}
	_setError(error: string | null): void {
		this.error = error;
	}
	_clearError(): void {
		this.error = null;
	}
	_setAllExerciseProgress(progress: {[blockExerciseId: string]: ExerciseProgress}): void {
		this.allExerciseProgress = progress;
	}
	_setCurrentExerciseAudioUrl(url: string | null): void {
		this.currentExerciseAudioUrl = url;
	}
	_setAudioLoading(isLoading: boolean): void {
		this.isAudioLoading = isLoading;
	}

	// Method to calculate block completion progress
	calculateBlockProgress = (block: SupabasePopulatedBlock): number => {
		if (!block.block_exercises || block.block_exercises.length === 0) {
			return 0; // Or 100 if an empty block is considered complete
		}
		const totalExercises = block.block_exercises.length;
		let completedExercises = 0;
		for (const be of block.block_exercises) {
			if (this.allExerciseProgress[be.id]?.isExerciseDone) {
				completedExercises++;
			}
		}
		return totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
	};

	async initializePage(workoutId: string, clientId: string): Promise<void> {
		if (this.currentWorkoutId === workoutId && !this.error && !this.loading && this.workoutData) {
			// Data for this workoutId already loaded, no need to re-fetch unless forced
			// Or if previous load resulted in error, allow retry.
			// console.log("Data already loaded for", workoutId);
			// return;
		}
        
		this.currentWorkoutId = workoutId;
		this.currentClientId = clientId;

		if (!this.currentWorkoutId) {
			this._setError("Workout ID is missing.");
			this._setLoading(false);
			return;
		}

		this._setLoading(true);
		this._clearError(); // Clear previous errors before a new fetch attempt
		try {
			const data = await fetchWorkoutDetailsById(this.currentWorkoutId);
			runInAction(() => {
				if (data) {
					this._setWorkoutData(data);
					if (this.currentClientId) {
						const progress = loadWorkoutProgressFromStorage(this.currentWorkoutId!, this.currentClientId);
						this._setAllExerciseProgress(progress);
					}
				} else {
					this._setError("Workout not found.");
					this._setWorkoutData(null); // Clear stale data
				}
				this._setLoading(false);
			});
		} catch (err) {
			console.error("Error fetching workout details:", err);
			runInAction(() => {
				this._setError(err instanceof Error ? err.message : "Failed to load workout details");
				this._setWorkoutData(null); // Clear stale data
				this._setLoading(false);
			});
		}
	}

	toggleListView = (): void => {
		this.isListView = !this.isListView;
	};

	openFinishDialog = (): void => {
		this.isFinishDialogOpen = true;
	};

	closeFinishDialog = (): void => {
		this.isFinishDialogOpen = false;
	};

	handleToggleExerciseCompleteList = (
		blockExerciseId: string,
		exerciseDefinition: SupabaseBlockExercise, // Ensure this type is correctly imported/defined
	): void => {
		if (!this.currentWorkoutId || !this.currentClientId) return;

		const existingProgress = this.allExerciseProgress[blockExerciseId];
		const isCurrentlyComplete = !!existingProgress?.isExerciseDone;
		const newCompletionState = !isCurrentlyComplete;

		const totalSets = typeof exerciseDefinition.sets === "number" && exerciseDefinition.sets > 0
			? exerciseDefinition.sets
			: 1;

		const updatedProgress: ExerciseProgress = {
			currentSet: newCompletionState ? totalSets : 0,
			isExerciseDone: newCompletionState,
		};
        
		// Create a new object for the progress map to ensure MobX picks up the change
		const newAllProgress = {
			...this.allExerciseProgress,
			[blockExerciseId]: updatedProgress,
		};
		this._setAllExerciseProgress(newAllProgress); // Use action to update

		saveExerciseProgressToStorage(this.currentWorkoutId, this.currentClientId, blockExerciseId, updatedProgress);
	};

	handleFinishWorkout = (): void => {
		if (!this.currentWorkoutId || !this.currentClientId) return;

		clearWorkoutProgressInStorage(this.currentWorkoutId, this.currentClientId);
		this._setAllExerciseProgress({}); // Use action to update
		// Consider if an alert is still needed and how to trigger it (e.g., a callback or an observable status)
		// alert("Workout progress cleared!"); 
		this.isFinishDialogOpen = false;
	};

	async fetchAndSetExerciseAudio(exerciseId: string, description: string): Promise<void> {
		if (!exerciseId || !description) {
			console.warn("fetchAndSetExerciseAudio: exerciseId or description is missing.");
			this._setCurrentExerciseAudioUrl(null);
			return;
		}
		this._setAudioLoading(true);
		this._setCurrentExerciseAudioUrl(null); // Clear previous URL
		try {
			const url = await getOrGenerateAudio(exerciseId, description);
			runInAction(() => {
				this._setCurrentExerciseAudioUrl(url);
				this._setAudioLoading(false);
			});
		} catch (error) {
			console.error("Error in fetchAndSetExerciseAudio:", error);
			runInAction(() => {
				this._setCurrentExerciseAudioUrl(null);
				this._setAudioLoading(false);
				// Optionally set an error state for audio fetching
			});
		}
	}

	// Start of new getters

	get getBlockExerciseById() {
		return (blockExerciseId: string): SupabaseBlockExercise | undefined => {
			if (!this.workoutData) return undefined;
			for (const block of this.workoutData.blocks) {
				const foundBe = block.block_exercises.find((be) => be.id === blockExerciseId);
				if (foundBe) return foundBe;
			}
			return undefined;
		};
	}

	// This getter assumes SupabaseBlockExercise has a nested 'exercise' property of type SupabaseExercise.
	// If not, and only exercise_id is available, this would need to search a flat list of exercises.
	get getExerciseById() {
		return (exerciseId: string): SupabaseExercise | undefined => {
			if (!this.workoutData) return undefined;
			for (const block of this.workoutData.blocks) {
				for (const be of block.block_exercises) {
					// Assuming be.exercise is the SupabaseExercise object or be.exercise_id exists
					if (be.exercise && be.exercise.id === exerciseId) {
						return be.exercise;
					}
					// If only be.exercise_id is present, this won't work directly without a flat list
				}
			}
			return undefined;
		};
	}

	get getExerciseProgressState() {
		return (blockExerciseId: string): { isComplete: boolean } => {
			const progress = this.allExerciseProgress[blockExerciseId];
			return { isComplete: !!progress?.isExerciseDone };
		};
	}

	// Comprehensive getter for dialog
	// Not using @computed because it takes an argument. MobX getters with args are just methods.
	getFullExerciseDetailsForDialog(blockExerciseId: string | null | undefined): {
		exercise: SupabaseExercise | undefined;
		blockExercise: SupabaseBlockExercise | undefined;
		exerciseName: string;
		vimeoCode: string | null | undefined;
		repsText: string;
		description: string;
		exerciseType: string;
		equipmentNeeded: string;
		isComplete: boolean;
	} | null {
		if (!blockExerciseId) return null;

		const blockExercise = this.getBlockExerciseById(blockExerciseId);
		if (!blockExercise || !blockExercise.exercise) return null; // Ensure exercise is populated
		const exercise = blockExercise.exercise; // Assuming exercise is nested

		const exerciseName = exercise.current_name || "Unnamed Exercise";
		const vimeoCode = exercise.vimeo_code;

		const parsedRepsInfo = parseSetsAndReps(blockExercise);
		let repsText = "";
		if (parsedRepsInfo.reps > 0 && (!blockExercise.unit || blockExercise.unit.toLowerCase().includes("rep") || blockExercise.unit.trim() === "")) {
			repsText = `${parsedRepsInfo.reps} reps`;
			if (blockExercise.sets_and_reps_text && blockExercise.sets_and_reps_text.toLowerCase().includes("left side")) {
				repsText += " Left Side";
			} else if (blockExercise.sets_and_reps_text && blockExercise.sets_and_reps_text.toLowerCase().includes("right side")) {
				repsText += " Right Side";
			} else if (blockExercise.sets_and_reps_text && blockExercise.sets_and_reps_text.toLowerCase().includes("each side")) {
				repsText += " each side";
			}
		} else if (blockExercise.sets_and_reps_text) {
			repsText = blockExercise.sets_and_reps_text;
		}

		const description = [
			exercise.explanation_1,
			exercise.explanation_2,
			exercise.explanation_3,
			exercise.explanation_4,
		]
			.filter(Boolean)
			.join(" ");

		const exerciseType = getDisplayableArrayString(exercise.over_sort_category);
		const equipmentNeeded = getDisplayableArrayString(exercise.equipment_public_name);
		const { isComplete } = this.getExerciseProgressState(blockExerciseId);

		return {
			exercise,
			blockExercise,
			exerciseName,
			vimeoCode,
			repsText,
			description,
			exerciseType,
			equipmentNeeded,
			isComplete,
		};
	}
	// End of new getters
} 