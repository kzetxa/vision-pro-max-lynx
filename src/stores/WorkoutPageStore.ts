import { makeObservable, observable, action, runInAction, computed } from "mobx";
import { fetchWorkoutDetailsById } from "../lib/api";
import type { SupabasePopulatedWorkout, SupabaseBlockExercise, SupabasePopulatedBlock, SupabaseExercise, WorkoutSummary } from "../lib/types";
import {
	loadWorkoutProgressFromStorage,
	clearWorkoutProgressInStorage,
	saveWorkoutProgressToStorage,
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
	specialSetProgress: { [specialSetName: string]: number } = {}; // Tracks completed rounds for each special set
	specialSetCurrentRoundIndex: { [specialSetName: string]: number } = {}; // For X-Y-Z format special sets, tracks which round we're on
	currentExerciseAudioUrl: string | null = null;
	isAudioLoading: boolean = false;
	workoutSummary: WorkoutSummary | null = null;
	isSummaryLoading: boolean = false;
	startTime: number = Date.now();

	// These will be set by an init method or passed if needed
	private currentWorkoutId?: string;

	// Helper methods for special set parsing
	private parseSpecialSetType(specialSetName: string): {
		type: 'half-split' | 'dash-sequence' | 'standard-circuit' | 'unknown';
		totalSets?: number;
		rounds?: number[];
	} {
		if (specialSetName.toLowerCase().includes("half split set")) {
			return { type: 'half-split', totalSets: 2 };
		}

		// X-Y-Z format (e.g., "9-7-5")
		const dashMatches = specialSetName.match(/(\d+)-(\d+)-(\d+)/);
		if (dashMatches) {
			const rounds = dashMatches.slice(1).map(Number);
			return { type: 'dash-sequence', rounds };
		}

		// More complex X-Y-Z-... format
		const complexDashMatches = specialSetName.match(/(\d+(?:-\d+)+)/);
		if (complexDashMatches) {
			const rounds = complexDashMatches[1].split('-').map(Number);
			return { type: 'dash-sequence', rounds };
		}

		// Standard Circuit: "X sets" format
		const setsMatch = specialSetName.match(/(\d+)\s+sets?/i);
		if (setsMatch) {
			const totalSets = parseInt(setsMatch[1]);
			return { type: 'standard-circuit', totalSets };
		}

		return { type: 'unknown' };
	}

	public getCurrentSetForSpecialSet(specialSetName: string): number {
		const progress = this.specialSetProgress[specialSetName] || 0;
		const parsed = this.parseSpecialSetType(specialSetName);

		switch (parsed.type) {
			case 'half-split':
				return (progress % 2);
			case 'standard-circuit':
				return progress;
			case 'dash-sequence':
				return progress + 1;
			default:
				return progress;
		}
	}

	public getTotalSetsForSpecialSet(specialSetName: string): number {
		const roundIndex = this.specialSetCurrentRoundIndex[specialSetName] || 0;
		const parsed = this.parseSpecialSetType(specialSetName);

		switch (parsed.type) {
			case 'half-split':
				return parsed.totalSets || 2;
			case 'standard-circuit':
				return parsed.totalSets || 1;
			case 'dash-sequence':
				return parsed.rounds?.[roundIndex] || 0;
			default:
				return 1;
		}
	}

	private willHaveMoreRoundsAfterCompletion(specialSetName: string): boolean {
		const currentProgress = this.specialSetProgress[specialSetName] || 0;
		const currentRoundIndex = this.specialSetCurrentRoundIndex[specialSetName] || 0;
		const parsed = this.parseSpecialSetType(specialSetName);

		switch (parsed.type) {
			case 'half-split':
				const currentSet = (currentProgress % 2) + 1;
				return currentSet === 1; // More rounds if we're on first set
			case 'dash-sequence':
				if (!parsed.rounds || currentRoundIndex >= parsed.rounds.length) return false;
				const targetRounds = parsed.rounds[currentRoundIndex];
				const dashProgressAfterCompletion = currentProgress + 1;
				
				if (dashProgressAfterCompletion >= targetRounds) {
					const nextRoundIndex = currentRoundIndex + 1;
					return nextRoundIndex < parsed.rounds.length;
				} else {
					return true;
				}
			case 'standard-circuit':
				const circuitProgressAfterCompletion = currentProgress + 1;
				return circuitProgressAfterCompletion < (parsed.totalSets || 0);
			default:
				return false;
		}
	}

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
			specialSetProgress: observable.deep,
			specialSetCurrentRoundIndex: observable.deep,
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
			handleSpecialSetExerciseCompletion: action,
			handleRegularExerciseCompletion: action,
			handleSpecialSetCompletion: action,
			handleFinishWorkout: action,
			fetchAndSetExerciseAudio: action,
			checkAndLoadSummary: action,
			// Internal setters for state changes within async operations
			_setWorkoutData: action,
			_setLoading: action,
			_setError: action,
			_setCompletedSets: action,
			_setExerciseCompletionInCurrentSet: action,
			_setSpecialSetProgress: action,
			_setSpecialSetCurrentRoundIndex: action,
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
	_setSpecialSetProgress(progress: { [specialSetName: string]: number }): void {
		this.specialSetProgress = progress;
	}
	_setSpecialSetCurrentRoundIndex(index: { [specialSetName: string]: number }): void {
		this.specialSetCurrentRoundIndex = index;
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

	// Helper method to handle special set progression
	handleSpecialSetCompletion = (specialSetName: string, _block: SupabasePopulatedBlock): boolean => {
		const progress = this.specialSetProgress[specialSetName] || 0;
		const roundIndex = this.specialSetCurrentRoundIndex[specialSetName] || 0;
		const parsed = this.parseSpecialSetType(specialSetName);
		
		switch (parsed.type) {
			case 'half-split':
				const newProgress = progress + 1;
				if (newProgress >= 2) {
					this._setSpecialSetProgress({ ...this.specialSetProgress, [specialSetName]: 0 });
					return true;
				} else {
					this._setSpecialSetProgress({ ...this.specialSetProgress, [specialSetName]: newProgress });
					return false;
				}
			
			case 'dash-sequence':
				if (!parsed.rounds || roundIndex >= parsed.rounds.length) return true;
				const targetRounds = parsed.rounds[roundIndex];
				const newDashProgress = progress + 1;
				
				if (newDashProgress >= targetRounds) {
					const newRoundIndex = roundIndex + 1;
					if (newRoundIndex >= parsed.rounds.length) {
						// All rounds completed
						this._setSpecialSetProgress({ ...this.specialSetProgress, [specialSetName]: 0 });
						this._setSpecialSetCurrentRoundIndex({ ...this.specialSetCurrentRoundIndex, [specialSetName]: 0 });
						return true;
					} else {
						// Move to next round
						this._setSpecialSetProgress({ ...this.specialSetProgress, [specialSetName]: 0 });
						this._setSpecialSetCurrentRoundIndex({ ...this.specialSetCurrentRoundIndex, [specialSetName]: newRoundIndex });
						return false;
					}
				} else {
					this._setSpecialSetProgress({ ...this.specialSetProgress, [specialSetName]: newDashProgress });
					return false;
				}
			
			case 'standard-circuit':
				const totalSets = parsed.totalSets || 1;
				const newCircuitProgress = progress + 1;
				
				if (newCircuitProgress >= totalSets) {
					this._setSpecialSetProgress({ ...this.specialSetProgress, [specialSetName]: 0 });
					return true;
				} else {
					this._setSpecialSetProgress({ ...this.specialSetProgress, [specialSetName]: newCircuitProgress });
					return false;
				}
			
			default:
				// Unknown type, just increment progress
				this._setSpecialSetProgress({ ...this.specialSetProgress, [specialSetName]: progress + 1 });
				return false;
		}
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
					this._setSpecialSetProgress(progress.specialSetProgress);
					this._setSpecialSetCurrentRoundIndex(progress.specialSetCurrentRoundIndex);
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
		if (!this.currentWorkoutId) return;
	
		const blockId = exerciseDefinition.block_overview_id;
		if (!blockId) return;
	
		const block = this.workoutData?.blocks.find(b => b.id === blockId);
		if (!block) return;
	
		// 1. Update the completion status of the toggled exercise
		const newCompletions = {
			...this.exerciseCompletionInCurrentSet,
			[blockExerciseId]: !this.exerciseCompletionInCurrentSet[blockExerciseId],
		};
		this._setExerciseCompletionInCurrentSet(newCompletions);

		// Check if this exercise is part of a special set
		if (exerciseDefinition.special_set) {
			this.handleSpecialSetExerciseCompletion(exerciseDefinition.special_set, block, newCompletions);
		} else {
			// Handle regular exercise completion (non-special set)
			this.handleRegularExerciseCompletion(blockExerciseId, exerciseDefinition, block, newCompletions);
		}
	};

	// Handle completion for exercises in special sets
	handleSpecialSetExerciseCompletion = (
		specialSetName: string,
		block: SupabasePopulatedBlock,
		newCompletions: { [blockExerciseId: string]: boolean }
	): void => {
		// Find all exercises in this special set
		const specialSetExercises = block.block_exercises.filter(ex => ex.special_set === specialSetName);
		
		// Check if all exercises in this special set are completed
		const specialSetCompleted = specialSetExercises.every(ex => newCompletions[ex.id]);
		
		if (specialSetCompleted) {
			// Progress the special set
			const isSpecialSetFullyComplete = this.handleSpecialSetCompletion(specialSetName, block);
			
			if (!isSpecialSetFullyComplete) {
				// Reset checkboxes for this special set for the next round/set
				const completionsForNextRound = { ...newCompletions };
				specialSetExercises.forEach(ex => {
					completionsForNextRound[ex.id] = false;
				});
				this._setExerciseCompletionInCurrentSet(completionsForNextRound);
				
				// Save and exit
				saveWorkoutProgressToStorage(this.currentWorkoutId!, {
					completedSets: this.completedSets,
					exerciseCompletionInCurrentSet: completionsForNextRound,
					specialSetProgress: this.specialSetProgress,
					specialSetCurrentRoundIndex: this.specialSetCurrentRoundIndex,
				});
				return;
			}
		}
		
		// Default save for partial completion or final completion
		saveWorkoutProgressToStorage(this.currentWorkoutId!, {
			completedSets: this.completedSets,
			exerciseCompletionInCurrentSet: newCompletions,
			specialSetProgress: this.specialSetProgress,
			specialSetCurrentRoundIndex: this.specialSetCurrentRoundIndex,
		});
	};

	// Handle completion for regular exercises (not in special sets)
	handleRegularExerciseCompletion = (
		blockExerciseId: string,
		_exerciseDefinition: SupabaseBlockExercise,
		_block: SupabasePopulatedBlock,
		newCompletions: { [blockExerciseId: string]: boolean }
	): void => {
		// For regular exercises, mark as complete immediately (all sets at once)
		if (newCompletions[blockExerciseId]) {
			// Exercise was just completed - mark all sets as complete
			// No need to track individual sets for regular exercises per requirements
		}
		
		// Save the completion state
		saveWorkoutProgressToStorage(this.currentWorkoutId!, {
			completedSets: this.completedSets,
			exerciseCompletionInCurrentSet: newCompletions,
			specialSetProgress: this.specialSetProgress,
			specialSetCurrentRoundIndex: this.specialSetCurrentRoundIndex,
		});
	};

	// Always mark an exercise as complete (never uncomplete)
	markExerciseComplete = (blockExerciseId: string, exerciseDefinition: SupabaseBlockExercise): void => {
		if (!this.currentWorkoutId) return;
		const blockId = exerciseDefinition.block_overview_id;
		if (!blockId) return;
		const block = this.workoutData?.blocks.find(b => b.id === blockId);
		if (!block) return;

		// 1. Always set the exercise as complete
		const newCompletions = {
			...this.exerciseCompletionInCurrentSet,
			[blockExerciseId]: true,
		};
		this._setExerciseCompletionInCurrentSet(newCompletions);

		// Check if this exercise is part of a special set
		if (exerciseDefinition.special_set) {
			this.handleSpecialSetExerciseCompletion(exerciseDefinition.special_set, block, newCompletions);
		} else {
			// Handle regular exercise completion (non-special set)
			this.handleRegularExerciseCompletion(blockExerciseId, exerciseDefinition, block, newCompletions);
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
			// Handle Half Split Set side display based on current progress
			if (blockExercise.special_set && blockExercise.special_set.toLowerCase().includes("half split set")) {
				const progress = this.specialSetProgress[blockExercise.special_set] || 0;
				const currentSet = (progress % 2) + 1;
				if (currentSet === 1) {
					repsText += " Left Side";
				} else {
					repsText += " Right Side";
				}
			} else if (blockExercise.sets_and_reps_text) {
				// Add side information if present in sets_and_reps_text for non-special sets
				const text = blockExercise.sets_and_reps_text.toLowerCase();
				if (text.includes("right side")) {
					repsText += " Right Side";
				} else if (text.includes("left side")) {
					repsText += " Left Side";
				} else if (text.includes("each side")) {
					repsText += " each side";
				}
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
	// Get the next exercise in the same block, considering special set flows
	getNextExerciseInBlock(blockExerciseId: string): SupabaseBlockExercise | null {
		if (!this.workoutData || !blockExerciseId) return null;

		// Find the current block exercise
		const currentBlockExercise = this.getBlockExerciseById(blockExerciseId);
		if (!currentBlockExercise || !currentBlockExercise.block_overview_id) return null;

		const blockId = currentBlockExercise.block_overview_id;
		
		// Find the block containing this exercise
		const block = this.workoutData.blocks.find(b => b.id === blockId);
		if (!block || !block.block_exercises) return null;

		// Find the current exercise index in the block
		const currentIndex = block.block_exercises.findIndex(be => be.id === blockExerciseId);
		if (currentIndex === -1) return null;

		// If current exercise is part of a special set, handle special set flow
		if (currentBlockExercise.special_set) {
			return this.getNextExerciseInSpecialSet(currentBlockExercise, block, currentIndex);
		}

		// For regular exercises, just return the next exercise in the block
		if (currentIndex === block.block_exercises.length - 1) return null;
		return block.block_exercises[currentIndex + 1];
	}

	// Helper method to handle navigation within special sets
	private getNextExerciseInSpecialSet(
		currentBlockExercise: SupabaseBlockExercise, 
		block: SupabasePopulatedBlock, 
		currentIndex: number
	): SupabaseBlockExercise | null {
		const specialSet = currentBlockExercise.special_set!;
		
		// Find all exercises in this special set
		const specialSetExercises = block.block_exercises.filter(ex => ex.special_set === specialSet);
		const specialSetIndices = specialSetExercises.map(ex => 
			block.block_exercises.findIndex(be => be.id === ex.id)
		);

		// Find current position within the special set
		const currentPositionInSpecialSet = specialSetIndices.indexOf(currentIndex);
		if (currentPositionInSpecialSet === -1) return null;

		// Check if we're at the last exercise in the special set
		const isLastInSpecialSet = currentPositionInSpecialSet === specialSetExercises.length - 1;

		if (isLastInSpecialSet) {
			// We're at the end of the special set exercises
			if (specialSet.toLowerCase().includes("half split set")) {
				const progress = this.specialSetProgress[specialSet] || 0;
				const currentSet = (progress % 2) + 1;
				
				if (currentSet === 1) {
					// We just finished the first side (Left), go back to first exercise for second side (Right)
					return specialSetExercises[0];
				} else {
					// We finished the second side (Right), move to next non-special set exercise
					return this.getNextNonSpecialSetExercise(block, specialSetIndices);
				}
			} else {
				// For other special set types, check if we need to repeat the set
				const willHaveMoreRounds = this.willHaveMoreRoundsAfterCompletion(specialSet);
				if (willHaveMoreRounds) {
					// Go back to first exercise in special set
					return specialSetExercises[0];
				} else {
					// Move to next non-special set exercise
					return this.getNextNonSpecialSetExercise(block, specialSetIndices);
				}
			}
		} else {
			// Move to next exercise within the special set
			return specialSetExercises[currentPositionInSpecialSet + 1];
		}
	}

	// Helper to find the next exercise after a special set
	private getNextNonSpecialSetExercise(block: SupabasePopulatedBlock, specialSetIndices: number[]): SupabaseBlockExercise | null {
		const maxSpecialSetIndex = Math.max(...specialSetIndices);
		if (maxSpecialSetIndex === block.block_exercises.length - 1) return null;
		return block.block_exercises[maxSpecialSetIndex + 1];
	}
	// End of new getters
} 