import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../contexts/StoreContext";
import styles from "./ExerciseDetailDialog.module.scss";
import type { ExerciseDetailDialogProps } from "./ExerciseDetailDialog"; // To get prop types for activeDialog

// Props are no longer passed to this component directly.
interface ExerciseVideoPlayerProps {}

const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = observer(() => {
	const { dialogStore, workoutPageStore } = useStore();

	const activeDialogProps = dialogStore.activeDialog?.props as ExerciseDetailDialogProps | undefined;
	const blockExerciseId = activeDialogProps?.blockExerciseId;

	if (!blockExerciseId) {
		// Render placeholder or nothing if ID is not available (e.g. dialog closing)
		return <div className={styles.videoPanel}><div className={styles.videoPlaceholder}>Loading video...</div></div>;
	}

	const details = workoutPageStore.getFullExerciseDetailsForDialog(blockExerciseId);

	if (!details) {
		return <div className={styles.videoPanel}><div className={styles.videoPlaceholder}>Video details not available.</div></div>;
	}

	const { exerciseName, vimeoCode } = details;

	return (
		<div className={styles.videoPanel}>
			{vimeoCode ? (
				<iframe
					allow="autoplay; fullscreen; picture-in-picture"
					allowFullScreen
					className={styles.videoFrame}
					frameBorder="0"
					src={`https://player.vimeo.com/video/${vimeoCode}?autoplay=1&muted=1&loop=1&autopause=0&controls=0&title=0&byline=0&portrait=0`}
					title={exerciseName}
				/>
			) : (
				<div className={styles.videoPlaceholder}>No Video Available</div>
			)}
		</div>
	);
});

export default ExerciseVideoPlayer; 