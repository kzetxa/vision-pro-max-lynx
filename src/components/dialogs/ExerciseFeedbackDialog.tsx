import { Cross2Icon, StarIcon } from "@radix-ui/react-icons";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useStore } from "../../contexts/StoreContext";
import { supabase, upsertUserVideoUpload } from "../../lib/supabase";
import type { SupabaseExercise } from "../../lib/types";
import { concatExplanationFields, getClientIdFromUrl } from "../../lib/utils";
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

const ExerciseFeedbackDialog: React.FC<ExerciseFeedbackDialogProps> = observer(({ exercise }) => {
	const { dialogStore } = useStore();
	const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
	const [isLoadingVideos, setIsLoadingVideos] = useState(false);
	const [feedbackError, setFeedbackError] = useState<string | null>(null);
	const [starredVideoIndex, setStarredVideoIndex] = useState<number | null>(null);

	useEffect(() => {
		const fetchVideos = async () => {
			const clientId = getClientIdFromUrl();
			setIsLoadingVideos(true);
			setFeedbackError(null);
			try {
				const { data, error } = await supabase
					.from("user_video_uploads")
					.select("vimeo_video_urls, starred_video_index")
					.eq("client_id", clientId)
					.eq("exercise_id", exercise.id)
					.maybeSingle();

				if (error) throw error;
				if (data && data.vimeo_video_urls) {
					setUploadedVideos(data.vimeo_video_urls);
					setStarredVideoIndex(
						typeof data.starred_video_index === "number" ? data.starred_video_index : null,
					);
				} else {
					setUploadedVideos([]);
					setStarredVideoIndex(null);
				}
			} catch (error: any) {
				console.error("Error fetching uploaded videos:", error);
				setFeedbackError("Could not load previously uploaded videos.");
				setUploadedVideos([]);
				setStarredVideoIndex(null);
			}
			setIsLoadingVideos(false);
		};
		fetchVideos();
	}, [exercise.id]);

	const handleUploadCompleted = async (result: VimeoUploadResponse) => {
		console.log("FileUpload complete:", result);
		setFeedbackError(null);
		const clientId = getClientIdFromUrl();
		if (result.success && result.videoId) {
			const vimeoUrl = `https://vimeo.com/${result.videoId}`;
			try {
				// If this is the first video, star it by default (index 0)
				const starredVideoIndex = uploadedVideos.length === 0 ? 0 : undefined;
				await upsertUserVideoUpload(clientId, exercise.id, vimeoUrl, starredVideoIndex);
				setUploadedVideos((prevVideos) => [...prevVideos, vimeoUrl]);
				console.log("Successfully saved video URL to Supabase.");
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
							{/* Upload tile (always first) */}
							<VideoUploadTile onUploadComplete={handleUploadCompleted} />
							{/* Video tiles */}
							{uploadedVideos.map((url, index) => {
								const vimeoIdMatch = url.match(/vimeo\.com\/(\d+)/);
								const vimeoId = vimeoIdMatch ? vimeoIdMatch[1] : null;
								// Assuming video creation/upload timestamp is not available yet in this scope.
								// Passing a placeholder or `undefined` for videoTimestamp.
								// You'll need to fetch/pass the actual timestamp when available.
								const placeholderTimestamp = new Date(); // Replace with actual timestamp

								return (
									<VideoDisplayTile
										index={index}
										isStarred={starredVideoIndex === index}
										key={index}
										onStarClick={handleStarClick}
										onTileClick={openVideoPlayerDialog}
										videoId={vimeoId || undefined} // Ensure videoId is passed
										videoTimestamp={placeholderTimestamp} // Pass timestamp
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
				<button 
					className={styles.submitButton} 
					onClick={() => {
						console.log("Submit feedback / video action for", exercise.id);
						dialogStore.popDialog();
					}}
				>
					Submit Video & View Feedback
				</button>
			</div>
		</div>
	);
});

export default ExerciseFeedbackDialog; 