import { Cross2Icon } from "@radix-ui/react-icons";
import { observer } from "mobx-react-lite";
import React, { useEffect, useMemo, useRef } from "react";
import { useStore } from "../../contexts/StoreContext";
import type { SupabaseExercise } from "../../lib/types";
import { concatExplanationFields, extractVimeoId } from "../../lib/utils";
import styles from "./ExerciseFeedbackDialog.module.scss";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer/ExerciseVideoPlayer";
import VideoDisplayTile from "./VideoDisplayTile";
import VideoUploadTile from "./VideoUploadTile";
import { ExerciseFeedbackDialogStore } from "../../stores/ExerciseFeedbackDialogStore";

export interface ExerciseFeedbackDialogProps {
  exercise: SupabaseExercise;
}

const ExerciseFeedbackDialog: React.FC<ExerciseFeedbackDialogProps> = observer(({ exercise }) => {
	const rootStore = useStore();
	const renderCount = useRef(0);

	// Log when the component renders and what the exercise prop is
	renderCount.current += 1;
	console.log(
		`ExerciseFeedbackDialog RENDER #${renderCount.current}: exercise prop ID: ${exercise?.id}, exercise prop name: ${exercise?.current_name}`,
	);

	const dialogStoreInstance = useMemo(() => {
		console.log(	`ExerciseFeedbackDialog RENDER #${renderCount.current}: Creating new ExerciseFeedbackDialogStore instance.`	);
		return new ExerciseFeedbackDialogStore(rootStore);
	}, [rootStore]); // rootStore is stable, so this should run once

	useEffect(() => {
		console.log(
			`ExerciseFeedbackDialog EFFECT [exercise?.id: ${exercise?.id}]: Initializing store. Current store exercise ID: ${dialogStoreInstance.exercise?.id}`,
		);
		if (exercise) {
			dialogStoreInstance.initialize(exercise);
		}
		// No cleanup needed for initialize, it resets the store internally if called again.
	}, [exercise, dialogStoreInstance]); // Runs when exercise or storeInstance changes

	const {
		uploadedVideos, // This is string[] in the current store
		videoFeedbacks,
		isLoading,
		error: feedbackError,
		starredVideoIndex, // This is number | null
		handleUploadCompleted,
		handleStarClick,
		openVideoPlayerDialog,
	} = dialogStoreInstance;

	// Log key states from the store
	console.log(
		`ExerciseFeedbackDialog RENDER #${renderCount.current}: Store state - isLoading: ${isLoading}, feedbackError: ${feedbackError}, uploadedVideos.length: ${uploadedVideos.length}, starredVideoIndex: ${starredVideoIndex}, store.exercise.id: ${dialogStoreInstance.exercise?.id}`,
	);

	const currentExerciseName = dialogStoreInstance.exercise?.current_name || "Exercise";
	const exerciseDescription = dialogStoreInstance.exercise ? concatExplanationFields(dialogStoreInstance.exercise) : "";

	// Loading state for the entire dialog, before store might have an exercise
	if (isLoading && !dialogStoreInstance.exercise) {
		console.log(`ExerciseFeedbackDialog RENDER #${renderCount.current}: Showing initial loading screen (store.isLoading && !store.exercise)`);
		return (
			<div className={styles.dialogOverlay}>
				<div className={styles.dialogContent}>
					<p>Loading exercise details...</p>
				</div>
			</div>
		);
	}
	
	// Error state if exercise itself couldn't be loaded into the store, or a critical error occurred
	if (!dialogStoreInstance.exercise) {
		console.log(`ExerciseFeedbackDialog RENDER #${renderCount.current}: Showing !store.exercise error/fallback screen. FeedbackError: ${feedbackError}`);
		return (
			<div className={styles.dialogOverlay} onClick={() => rootStore.dialogStore.popDialog()}>
				<div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
					<button 
						aria-label="Close feedback dialog" 
						className={styles.closeButton}
						onClick={() => rootStore.dialogStore.popDialog()}
					>
						<Cross2Icon />
					</button>
					<h2 className={styles.title}>Error</h2>
					<p>{feedbackError || "Exercise data is not available."}</p>
				</div>
			</div>
		);
	}

	// Main dialog content once store.exercise is available
	console.log(`ExerciseFeedbackDialog RENDER #${renderCount.current}: Rendering main dialog content.`);
	return (
		<div className={styles.dialogOverlay} onClick={() => rootStore.dialogStore.popDialog()}>
			<div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
				<button 
					aria-label="Close feedback dialog" 
					className={styles.closeButton}
					onClick={() => rootStore.dialogStore.popDialog()}
				>
					<Cross2Icon />
				</button>
				<h2 className={styles.title}>Feedback for: {currentExerciseName}</h2>
				<ExerciseVideoPlayer roundedBottomCorners />
				<div className={styles.section}>
					<h3 className={styles.sectionTitle}>Exercise Description</h3>
					<p className={styles.descriptionText}>
						{exerciseDescription}
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
						{isLoading && uploadedVideos.length === 0 && <p>Loading your videos...</p>}
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
										key={vimeoId || index}
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
			</div>
		</div>
	);
});

export default ExerciseFeedbackDialog; 