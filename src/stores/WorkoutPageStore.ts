import { makeObservable, observable, action, runInAction, computed } from "mobx";
import { fetchWorkoutDetailsById } from "../lib/api";
import type { SupabasePopulatedWorkout, SupabaseBlockExercise, SupabasePopulatedBlock, SupabaseExercise, WorkoutSummary } from "../lib/types";
import {
	loadWorkoutProgressFromStorage,
	clearWorkoutProgressInStorage,
	saveExerciseProgressToStorage,
	type ExerciseProgress,
} from "../lib/localStorage";
import {
	parseSetsAndReps,
	getDisplayableArrayString,
	getClientIdFromUrl,
} from "../lib/utils";
import type { RootStore } from "./RootStore";
import { getOrGenerateAudio, getWorkoutSummary, saveWorkoutSummary } from "../lib/supabase";


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
	workoutSummary: WorkoutSummary | null = null;
	isSummaryLoading: boolean = false;
	startTime: number = Date.now();

	// These will be set by an init method or passed if needed
	private currentWorkoutId?: string;

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
			workoutSummary: observable,
			isSummaryLoading: observable,
			startTime: observable,

			// Actions
			initializePage: action,
			toggleListView: action,
			openFinishDialog: action,
			closeFinishDialog: action,
			handleToggleExerciseCompleteList: action,
			handleFinishWorkout: action,
			fetchAndSetExerciseAudio: action,
			checkAndLoadSummary: action,
			// Internal setters for state changes within async operations
			_setWorkoutData: action,
			_setLoading: action,
			_setError: action,
			_setAllExerciseProgress: action,
			_clearError: action,
			_setCurrentExerciseAudioUrl: action,
			_setAudioLoading: action,
			_setWorkoutSummary: action,
			_setSummaryLoading: action,

			// Computed properties / getters
			getBlockExerciseById: computed,
			getExerciseById: computed,
			getExerciseProgressState: computed,
			workoutStats: computed,
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
	_setWorkoutSummary(summary: WorkoutSummary | null): void {
		this.workoutSummary = summary;
	}
	_setSummaryLoading(loading: boolean): void {
		this.isSummaryLoading = loading;
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

	async initializePage(workoutId: string): Promise<void> {
		this.currentWorkoutId = workoutId;
		this.startTime = Date.now();
		this._setLoading(true);
		this._clearError(); // Clear previous errors before a new fetch attempt
		
		await this.checkAndLoadSummary();
		if(this.workoutSummary) {
			this._setLoading(false);
			this.openFinishDialog();
			return;
		}

		try {
			const data = await fetchWorkoutDetailsById(workoutId);
			runInAction(() => {
				if (data) {
					this._setWorkoutData(data);
					const progress = loadWorkoutProgressFromStorage(workoutId);
					this._setAllExerciseProgress(progress);
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

	async checkAndLoadSummary(): Promise<void> {
		const clientId = getClientIdFromUrl();
		if (!this.currentWorkoutId || !clientId) return;
		
		this._setSummaryLoading(true);
		try {
			const summary = await getWorkoutSummary(this.currentWorkoutId, clientId);
			runInAction(() => {
				if (summary) {
					this._setWorkoutSummary(summary);
				}
				this._setSummaryLoading(false);
			});
		} catch (error) {
			console.error("Failed to check for existing workout summary", error);
			runInAction(() => this._setSummaryLoading(false));
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
		exerciseDefinition: SupabaseBlockExercise,
	): void => {
		if (!this.currentWorkoutId || !getClientIdFromUrl()) return;

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
		this._setAllExerciseProgress(newAllProgress);

		saveExerciseProgressToStorage(this.currentWorkoutId, blockExerciseId, updatedProgress);
	};

	get workoutStats() {
		if (this.workoutSummary) {
			return {
				totalTime: new Date(this.workoutSummary.total_time_seconds * 1000).toISOString().substr(14, 5),
				sets: this.workoutSummary.total_sets_completed,
				reps: this.workoutSummary.total_reps_completed,
				skipped: this.workoutSummary.total_sets_skipped,
			};
		}
		
		if (!this.workoutData) return null;

		let setsCompleted = 0;
		let repsCompleted = 0;
		let setsSkipped = 0;
		
		this.workoutData.blocks.forEach(block => {
			block.block_exercises.forEach(be => {
				const progress = this.allExerciseProgress[be.id];
				const { sets, reps } = parseSetsAndReps(be);
				
				if (progress?.isExerciseDone) {
					setsCompleted += sets;
					repsCompleted += sets * reps;
				} else {
					setsSkipped += sets;
				}
			});
		});

		const totalTimeSeconds = Math.round((Date.now() - this.startTime) / 1000);
		
		return {
			totalTime: new Date(totalTimeSeconds * 1000).toISOString().substr(14, 5),
			sets: setsCompleted,
			reps: repsCompleted,
			skipped: setsSkipped,
		};
	}

	handleFinishWorkout = async (): Promise<void> => {
		const clientId = getClientIdFromUrl();
		if (!this.currentWorkoutId || !clientId || !this.workoutData) return;
		
		const stats = this.workoutStats;
		if (!stats) return;

		const totalTimeSeconds = Math.round((Date.now() - this.startTime) / 1000);

		const summaryData: WorkoutSummary = {
			workout_id: this.currentWorkoutId,
			client_id: clientId,
			total_time_seconds: totalTimeSeconds,
			total_sets_completed: stats.sets,
			total_reps_completed: stats.reps,
			total_sets_skipped: stats.skipped,
		};

		try {
			await saveWorkoutSummary(summaryData);
			runInAction(() => {
				this._setWorkoutSummary(summaryData);
				clearWorkoutProgressInStorage(this.currentWorkoutId!);
				this.openFinishDialog();
			});
		} catch (error) {
			console.error("Failed to save workout summary", error);
			// Optionally set an error state
		}
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