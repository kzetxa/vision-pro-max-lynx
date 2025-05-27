import { Cross2Icon, StarIcon } from "@radix-ui/react-icons";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useStore } from "../../contexts/StoreContext";
import { supabase, upsertUserVideoUpload } from "../../lib/supabase";
import type { SupabaseExercise } from "../../lib/types";
import { concatExplanationFields, getClientIdFromUrl, extractVimeoId } from "../../lib/utils";
import { VimeoUploadResponse } from "../../lib/vimeoUtils";
import styles from "./ExerciseFeedbackDialog.module.scss";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer/ExerciseVideoPlayer";
import VideoDisplayTile from "./VideoDisplayTile";
import VideoPlayerDialog, { VideoPlayerDialogProps } from "./VideoPlayerDialog";
import VideoUploadTile from "./VideoUploadTile";
import { SmartIcon } from "../SmartIcon";

export interface ExerciseFeedbackDialogProps {
  exercise: SupabaseExercise;
}

interface VideoFeedback {
  vimeo_code: string;
  feedback: string | null;
}

const ExerciseFeedbackDialog: React.FC<ExerciseFeedbackDialogProps> = observer(({ exercise }) => {
	const { dialogStore } = useStore();
	const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
	const [videoFeedbacks, setVideoFeedbacks] = useState<Record<string, string | null>>({});
	const [isLoadingVideos, setIsLoadingVideos] = useState(false);
	const [feedbackError, setFeedbackError] = useState<string | null>(null);
	const [starredVideoIndex, setStarredVideoIndex] = useState<number | null>(null);

	useEffect(() => {
		const fetchVideosAndFeedback = async () => {
			const clientId = getClientIdFromUrl();
			setIsLoadingVideos(true);
			setFeedbackError(null);
			setVideoFeedbacks({});

			try {
				const { data, error } = await supabase
					.from("user_video_uploads")
					.select("vimeo_video_urls, starred_video_index")
					.eq("client_id", clientId)
					.eq("exercise_id", exercise.id)
					.maybeSingle();

				if (error) throw error;

				let currentUploadedVideos: string[] = [];
				if (data && data.vimeo_video_urls) {
					currentUploadedVideos = data.vimeo_video_urls;
					setUploadedVideos(currentUploadedVideos);
					setStarredVideoIndex(
						typeof data.starred_video_index === "number" ? data.starred_video_index : null,
					);
				} else {
					setUploadedVideos([]);
					setStarredVideoIndex(null);
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
							} else {
								const fetchedFeedbacks = await feedbackResponse.json() as VideoFeedback[];
								const feedbackMap: Record<string, string | null> = {};
								fetchedFeedbacks.forEach((fb) => {
									if (fb.vimeo_code) {
										feedbackMap[fb.vimeo_code] = fb.feedback;
									}
								});
								setVideoFeedbacks(feedbackMap);
							}
						} catch (feedbackFetchError: any) {
							console.error("Failed to fetch video feedback from Netlify function:", feedbackFetchError);
						}
					}
				}
			} catch (error: any) {
				console.error("Error fetching uploaded videos:", error);
				setFeedbackError("Could not load previously uploaded videos.");
				setUploadedVideos([]);
				setStarredVideoIndex(null);
			}
			setIsLoadingVideos(false);
		};
		fetchVideosAndFeedback();
	}, [exercise.id]);

	const handleUploadCompleted = async (result: VimeoUploadResponse) => {
		console.log("FileUpload complete:", result);
		setFeedbackError(null);
		const clientId = getClientIdFromUrl();
		if (result.success && result.videoId) {
			const vimeoUrl = `https://vimeo.com/${result.videoId}`;
			const vimeoCode = result.videoId;
			try {
				const starredVideoIndexToSet = uploadedVideos.length === 0 ? 0 : undefined;
				await upsertUserVideoUpload(clientId, exercise.id, vimeoUrl, starredVideoIndexToSet);
				setUploadedVideos((prevVideos) => [...prevVideos, vimeoUrl]);
				console.log("Successfully saved video URL to Supabase.");

				try {
					console.log(`Calling Netlify function to process video: ${vimeoCode} for exercise: ${exercise.id}`);
					const response = await fetch("/.netlify/functions/airtable-video-processor", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							vimeo_code: vimeoCode,
							supabase_exercise_id: exercise.id,
						}),
					});

					if (!response.ok) {
						const errorBody = await response.text();
						console.error("Netlify function call failed:", response.status, errorBody);
					} else {
						const responseData = await response.json();
						console.log("Netlify function call successful:", responseData);
					}
				} catch (netlifyError: any) {
					console.error("Error calling Netlify function:", netlifyError);
				}
			} catch (error: any) {
				console.error("Error saving video URL to Supabase:", error);
				setFeedbackError(`Failed to save video: ${error.message}`);
			}
		} else if (result.error) {
			setFeedbackError(`Upload failed: ${result.error}`);
		}
	};

	const handleStarClick = async (index: number) => {
		const clientId = getClientIdFromUrl();
		try {
			await upsertUserVideoUpload(clientId, exercise.id, uploadedVideos[index], index);
			setStarredVideoIndex(index);
		} catch (error: any) {
			console.error("Error starring video:", error);
			setFeedbackError(`Failed to star video: ${error.message}`);
		}
	};

	const openVideoPlayerDialog = (videoUrl: string) => {
		const vimeoIdMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
		if (vimeoIdMatch && vimeoIdMatch[1]) {
			dialogStore.pushDialog(VideoPlayerDialog, { vimeoCode: vimeoIdMatch[1] } as VideoPlayerDialogProps);
		} else {
			console.error("Could not extract Vimeo ID from URL:", videoUrl);
			setFeedbackError("Could not play this video link.");
		}
	};

	return (
		<div className={styles.dialogOverlay} onClick={() => dialogStore.popDialog()}>
			<div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
				<button 
					aria-label="Close feedback dialog" 
					className={styles.closeButton}
					onClick={() => dialogStore.popDialog()}
				>
					<Cross2Icon />
				</button>
				<h2 className={styles.title}>Feedback for: {exercise.current_name || "Exercise"}</h2>
				<ExerciseVideoPlayer roundedBottomCorners />
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Exercise Description</h3>
					<p className={styles.descriptionText}>
						{concatExplanationFields(exercise)}
					</p>
				</div>
				<div className={styles.section}>
					<div id="video-upload-section">
						<h3 className={styles.sectionTitle}>Upload Your Video</h3>
						<p className={styles.descriptionText}>
							Share a video of your performance for feedback.
						</p>
					</div>
					{feedbackError && <p className={styles.errorMessage}>{feedbackError}</p>}
					<div className={styles.uploadedVideosSection}>
						{isLoadingVideos && <p>Loading your videos...</p>}
						<div className={styles.uploadedVideosGrid}>
							<VideoUploadTile onUploadComplete={handleUploadCompleted} />
							{uploadedVideos.map((url, index) => {
								const vimeoId = extractVimeoId(url);
								const placeholderTimestamp = new Date();
								const feedbackText = vimeoId ? videoFeedbacks[vimeoId] : null;

								return (
									<VideoDisplayTile
										feedback={feedbackText}
										index={index}
										isStarred={starredVideoIndex === index}
										key={index}
										onStarClick={handleStarClick}
										onTileClick={openVideoPlayerDialog}
										videoId={vimeoId || undefined}
										videoTimestamp={placeholderTimestamp}
										videoUrl={url}
									/>
								);
							})}
						</div>
					</div>
				</div>
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Coach&apos;s Feedback</h3>
					<textarea 
						className={styles.feedbackTextarea}
						placeholder="Coach will provide feedback here..."
						readOnly
					/>
				</div>
			</div>
		</div>
	);
});

export default ExerciseFeedbackDialog; 