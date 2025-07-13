import { makeObservable, observable, action, runInAction, computed } from "mobx";
import { fetchWorkoutDetailsById } from "../lib/api";
import type { SupabasePopulatedWorkout, SupabaseBlockExercise, SupabasePopulatedBlock, SupabaseExercise, WorkoutSummary } from "../lib/types";
import {
	loadWorkoutProgressFromStorage,
	clearWorkoutProgressInStorage,
	saveWorkoutProgressToStorage,
	type WorkoutProgressStorage,
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
	completedSets: { [blockId: string]: number } = {};
	exerciseCompletionInCurrentSet: { [blockExerciseId:string]: boolean } = {};
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
			completedSets: observable.deep,
			exerciseCompletionInCurrentSet: observable.deep,
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
			_setCompletedSets: action,
			_setExerciseCompletionInCurrentSet: action,
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
	_setCompletedSets(completedSets: { [blockId: string]: number }): void {
		this.completedSets = completedSets;
	}
	_setExerciseCompletionInCurrentSet(completion: { [exerciseId: string]: boolean }): void {
		this.exerciseCompletionInCurrentSet = completion;
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
			return 100;
		}

		const totalSets = block.block_exercises.reduce((max, ex) => Math.max(max, ex.sets || 1), 1);
		if (totalSets === 0) return 100;

		const completedSetsForBlock = this.completedSets[block.id] || 0;

		let exercisesCompletedInCurrentSet = 0;
		if (completedSetsForBlock < totalSets) {
			for (const be of block.block_exercises) {
				if (this.exerciseCompletionInCurrentSet[be.id]) {
					exercisesCompletedInCurrentSet++;
				}
			}
		}

		const progressInCurrentSet = block.block_exercises.length > 0 ? (exercisesCompletedInCurrentSet / block.block_exercises.length) : 0;
		const totalProgress = (completedSetsForBlock + progressInCurrentSet) / totalSets;

		return Math.min(totalProgress * 100, 100);
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
					this._setCompletedSets(progress.completedSets);
					this._setExerciseCompletionInCurrentSet(progress.exerciseCompletionInCurrentSet);
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

		const blockId = exerciseDefinition.block_overview_id;
		if (!blockId) {
			console.error("Inconsistent data: block_overview_id is missing from exercise definition.");
			return;
		}

		const newCompletionState = !this.exerciseCompletionInCurrentSet[blockExerciseId];
		const newCompletions = {
			...this.exerciseCompletionInCurrentSet,
			[blockExerciseId]: newCompletionState,
		};
		this._setExerciseCompletionInCurrentSet(newCompletions);
		saveWorkoutProgressToStorage(this.currentWorkoutId, { exerciseCompletionInCurrentSet: newCompletions });

		const block = this.workoutData?.blocks.find(b => b.id === blockId);
		if (!block) return;

		const allExercisesInBlockCompleteForSet = block.block_exercises.every(
			ex => this.exerciseCompletionInCurrentSet[ex.id]
		);

		if (allExercisesInBlockCompleteForSet) {
			const totalSets = block.block_exercises.reduce((max, ex) => Math.max(max, ex.sets || 1), 1);
			const currentCompletedSets = this.completedSets[blockId] || 0;

			if (currentCompletedSets < totalSets) {
				const newCompletedSetsCount = currentCompletedSets + 1;
				const newCompletedSets = { ...this.completedSets, [blockId]: newCompletedSetsCount };
				this._setCompletedSets(newCompletedSets);
				
				// Reset exercise completion for the block for the next set
				const newCompletionsAfterReset = { ...this.exerciseCompletionInCurrentSet };
				block.block_exercises.forEach(ex => {
					newCompletionsAfterReset[ex.id] = false;
				});
				this._setExerciseCompletionInCurrentSet(newCompletionsAfterReset);

				// Save both changes to storage
				saveWorkoutProgressToStorage(this.currentWorkoutId, {
					completedSets: newCompletedSets,
					exerciseCompletionInCurrentSet: newCompletionsAfterReset
				});
			}
		}
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
			const totalSetsInBlock = block.block_exercises.reduce((max, ex) => Math.max(max, ex.sets || 1), 1);
			const completedSetsForBlock = this.completedSets[block.id] || 0;
			
			setsCompleted += completedSetsForBlock;
			setsSkipped += totalSetsInBlock - completedSetsForBlock;

			block.block_exercises.forEach(be => {
				const { reps } = parseSetsAndReps(be);
				repsCompleted += completedSetsForBlock * reps;
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
		return (blockExerciseId: string | null | undefined): SupabaseBlockExercise | undefined => {
			if (!this.workoutData || !blockExerciseId) return undefined;
			for (const block of this.workoutData.blocks) {
				const found = block.block_exercises.find(be => be.id === blockExerciseId);
				if (found) return found;
			}
			return undefined;
		};
	}

	// This getter assumes SupabaseBlockExercise has a nested 'exercise' property of type SupabaseExercise.
	// If not, and only exercise_id is available, this would need to search a flat list of exercises.
	get getExerciseById() {
		return (exerciseId: string | null | undefined): SupabaseExercise | undefined => {
			if (!this.workoutData || !exerciseId) return undefined;
			for (const block of this.workoutData.blocks) {
				for (const be of block.block_exercises) {
					if (be.exercise?.id === exerciseId) {
						return be.exercise;
					}
				}
			}
			return undefined;
		};
	}

	get getExerciseProgressState() {
		return (blockExerciseId: string): { isComplete: boolean; currentSet: number; totalSets: number } => {
			const blockExercise = this.getBlockExerciseById(blockExerciseId);
			if (!blockExercise || !blockExercise.block_overview_id) {
				return { isComplete: false, currentSet: 0, totalSets: 1 };
			}
			
			const blockId = blockExercise.block_overview_id;
			const totalSets = blockExercise.sets || 1;
			const completedSets = this.completedSets[blockId] || 0;

			return {
				isComplete: this.exerciseCompletionInCurrentSet[blockExerciseId] || false,
				currentSet: completedSets + 1,
				totalSets,
			};
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
		const exercise = blockExercise?.exercise;
		const progress = this.getExerciseProgressState(blockExerciseId);
		
		if (!exercise || !blockExercise) return null;

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
			.join(" ") || 'No description available.';

		const exerciseType = getDisplayableArrayString(exercise.over_sort_category);
		const equipmentNeeded = getDisplayableArrayString(exercise.equipment_public_name);

		return {
			exercise,
			blockExercise,
			exerciseName: exercise.current_name || "Unnamed Exercise",
			vimeoCode: exercise.vimeo_code,
			repsText,
			description,
			exerciseType,
			equipmentNeeded,
			isComplete: progress.isComplete,
		};
	}
	// End of new getters
} 