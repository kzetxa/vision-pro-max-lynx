import { makeObservable, observable, action, runInAction } from "mobx";
import type { SupabaseExercise } from "../lib/types";
import { supabase, upsertUserVideoUpload } from "../lib/supabase";
import { getClientIdFromUrl, extractVimeoId } from "../lib/utils";
import type { VimeoUploadResponse } from "../lib/vimeoUtils";
import type { RootStore } from "./RootStore";
import VideoPlayerDialog, { VideoPlayerDialogProps } from "../components/dialogs/VideoPlayerDialog";

interface VideoFeedback {
  vimeo_code: string;
  feedback: string | null;
}

export class ExerciseFeedbackDialogStore {
	rootStore: RootStore;
	exercise: SupabaseExercise | null = null;
	uploadedVideos: string[] = [];
	videoFeedbacks: Record<string, string | null> = {}; // Store feedback by vimeo_code
	isLoading: boolean = true;
	error: string | null = null;
	starredVideoIndex: number | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeObservable(this, {
			exercise: observable,
			uploadedVideos: observable.shallow, // Array of strings, shallow is fine
			videoFeedbacks: observable.deep, // Object, deep is appropriate
			isLoading: observable,
			error: observable,
			starredVideoIndex: observable,

			initialize: action.bound,
			fetchVideosAndFeedback: action.bound,
			handleUploadCompleted: action.bound,
			handleStarClick: action.bound,
			openVideoPlayerDialog: action.bound,
			_setExercise: action,
			_setUploadedVideos: action,
			_setVideoFeedbacks: action,
			_setIsLoading: action,
			_setError: action,
			_setStarredVideoIndex: action,
			_clearError: action,
			_reset: action,

			// Computed for convenience if needed, e.g.,
			// currentExerciseName: computed,
		});
	}

	_setExercise(exercise: SupabaseExercise | null): void {
		this.exercise = exercise;
	}
	_setUploadedVideos(videos: string[]): void {
		this.uploadedVideos = videos;
	}
	_setVideoFeedbacks(feedbacks: Record<string, string | null>): void {
		this.videoFeedbacks = feedbacks;
	}
	_setIsLoading(loading: boolean): void {
		this.isLoading = loading;
	}
	_setError(error: string | null): void {
		this.error = error;
	}
	_setStarredVideoIndex(index: number | null): void {
		this.starredVideoIndex = index;
	}
	_clearError(): void {
		this.error = null;
	}
	_reset(): void {
		this.exercise = null;
		this.uploadedVideos = [];
		this.videoFeedbacks = {};
		this.isLoading = true;
		this.error = null;
		this.starredVideoIndex = null;
	}

	initialize = async (exercise: SupabaseExercise): Promise<void> => {
		this._reset(); // Reset state before initializing with a new exercise
		this._setExercise(exercise);
		await this.fetchVideosAndFeedback();
	};

	fetchVideosAndFeedback = async (): Promise<void> => {
		if (!this.exercise) {
			this._setError("Exercise not set for fetching feedback.");
			this._setIsLoading(false);
			return;
		}

		const clientId = getClientIdFromUrl();
		this._setIsLoading(true);
		this._clearError();
		// this._setVideoFeedbacks({}); // Already done in _reset or if prefer here

		try {
			const { data, error: supabaseError } = await supabase
				.from("user_video_uploads")
				.select("vimeo_video_urls, starred_video_index")
				.eq("client_id", clientId)
				.eq("exercise_id", this.exercise.id)
				.maybeSingle();

			if (supabaseError) throw supabaseError;

			let currentUploadedVideos: string[] = [];
			if (data && data.vimeo_video_urls) {
				currentUploadedVideos = data.vimeo_video_urls;
				this._setUploadedVideos(currentUploadedVideos);
				this._setStarredVideoIndex(typeof data.starred_video_index === "number" ? data.starred_video_index : null);
			} else {
				this._setUploadedVideos([]);
				this._setStarredVideoIndex(null);
			}

			if (currentUploadedVideos.length > 0) {
				const vimeoCodes = currentUploadedVideos.map((url) => extractVimeoId(url)).filter((id) => id !== null) as string[];
				if (vimeoCodes.length > 0) {
					try {
						const feedbackResponse = await fetch("/.netlify/functions/get-video-feedbacks", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ vimeo_codes: vimeoCodes }),
						});

						if (!feedbackResponse.ok) {
							const errBody = await feedbackResponse.text();
							console.error("Error fetching video feedback:", feedbackResponse.status, errBody);
							// Optionally set a user-facing error specific to feedback loading
						} else {
							const fetchedFeedbacks = await feedbackResponse.json() as VideoFeedback[];
							const feedbackMap: Record<string, string | null> = {};
							fetchedFeedbacks.forEach((fb) => {
								if (fb.vimeo_code) {
									feedbackMap[fb.vimeo_code] = fb.feedback;
								}
							});
							this._setVideoFeedbacks(feedbackMap);
						}
					} catch (feedbackFetchError: any) {
						console.error("Failed to fetch video feedback from Netlify function:", feedbackFetchError);
						// Optionally set a user-facing error here
					}
				}
			}
			runInAction(() => this._setIsLoading(false));
		} catch (err: any) {
			console.error("Error fetching uploaded videos:", err);
			runInAction(() => {
				this._setError(err.message || "Could not load previously uploaded videos.");
				this._setUploadedVideos([]);
				this._setStarredVideoIndex(null);
				this._setIsLoading(false);
			});
		}
	};

	handleUploadCompleted = async (result: VimeoUploadResponse): Promise<void> => {
		if (!this.exercise) {
			this._setError("Cannot process upload without an active exercise.");
			return;
		}
		this._clearError();
		const clientId = getClientIdFromUrl();

		if (result.success && result.videoId) {
			const vimeoUrl = `https://vimeo.com/${result.videoId}`;
			const vimeoCode = result.videoId;
			try {
				const starredIndexToSet = this.uploadedVideos.length === 0 ? 0 : undefined;
				await upsertUserVideoUpload(clientId, this.exercise.id, vimeoUrl, starredIndexToSet);
        
				runInAction(() => {
					this._setUploadedVideos([...this.uploadedVideos, vimeoUrl]);
					if (starredIndexToSet === 0) {
						this._setStarredVideoIndex(0);
					}
				});
				console.log("Successfully saved video URL to Supabase.");

				try {
					console.log(`Calling Netlify function to process video: ${vimeoCode} for exercise: ${this.exercise.id}`);
					const response = await fetch("/.netlify/functions/airtable-video-processor", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							vimeo_code: vimeoCode,
							supabase_exercise_id: this.exercise.id,
						}),
					});
					if (!response.ok) {
						const errorBody = await response.text();
						console.error("Airtable Netlify function call failed:", response.status, errorBody);
						// Not setting a user-facing error for this, logging is enough for now
					} else {
						const responseData = await response.json();
						console.log("Airtable Netlify function call successful:", responseData);
					}
				} catch (netlifyError: any) {
					console.error("Error calling Airtable Netlify function:", netlifyError);
				}
			} catch (error: any) {
				console.error("Error saving video URL to Supabase:", error);
				this._setError(`Failed to save video: ${error.message}`);
			}
		} else if (result.error) {
			this._setError(`Upload failed: ${result.error}`);
		}
	};

	handleStarClick = async (indexToStar: number): Promise<void> => {
		if (!this.exercise || !this.uploadedVideos[indexToStar]) {
			this._setError("Cannot star video: missing exercise or video URL.");
			return;
		}
		this._clearError();
		const clientId = getClientIdFromUrl();
		const videoUrlToStar = this.uploadedVideos[indexToStar];

		try {
			await upsertUserVideoUpload(clientId, this.exercise.id, videoUrlToStar, indexToStar);
			this._setStarredVideoIndex(indexToStar);
		} catch (error: any) {
			console.error("Error starring video:", error);
			this._setError(`Failed to star video: ${error.message}`);
		}
	};

	openVideoPlayerDialog = (videoUrl: string): void => {
		const vimeoIdMatch = extractVimeoId(videoUrl); // Use extractVimeoId directly
		if (vimeoIdMatch) {
			this.rootStore.dialogStore.pushDialog(VideoPlayerDialog, { vimeoCode: vimeoIdMatch } as VideoPlayerDialogProps);
		} else {
			console.error("Could not extract Vimeo ID from URL:", videoUrl);
			this._setError("Could not play this video link."); // Set error in store
		}
	};

	// Example computed property (if SupabaseExercise is always set after init)
	// get currentExerciseName(): string {
	//   return this.exercise?.current_name || "Exercise";
	// }
} 