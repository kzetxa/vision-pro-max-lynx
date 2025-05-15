import { makeObservable, observable, action, runInAction } from "mobx";
import { fetchWorkoutDetailsById } from "../lib/api";
import type { SupabasePopulatedWorkout, SupabaseBlockExercise, SupabasePopulatedBlock } from "../lib/types";
import {
	loadWorkoutProgressFromStorage,
	clearWorkoutProgressInStorage,
	saveExerciseProgressToStorage,
	type ExerciseProgress,
} from "../lib/localStorage";
import type { RootStore } from "./RootStore";


export class WorkoutPageStore {
	rootStore: RootStore; // To access other stores if needed in the future
	workoutData: SupabasePopulatedWorkout | null = null;
	loading: boolean = true;
	error: string | null = null;
	isListView: boolean = false;
	isFinishDialogOpen: boolean = false;
	allExerciseProgress: {[blockExerciseId: string]: ExerciseProgress} = {};

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

			// Actions
			initializePage: action,
			toggleListView: action,
			openFinishDialog: action,
			closeFinishDialog: action,
			handleToggleExerciseCompleteList: action,
			handleFinishWorkout: action,
			// Internal setters for state changes within async operations
			_setWorkoutData: action,
			_setLoading: action,
			_setError: action,
			_setAllExerciseProgress: action,
			_clearError: action,
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
} 