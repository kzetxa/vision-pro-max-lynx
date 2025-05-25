import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../contexts/StoreContext"; // Adjusted import path
import styles from "./ExerciseVideoPlayer.module.scss"; // New SCSS module
import type { ExerciseDetailDialogProps } from "../ExerciseDetailDialog"; // Adjusted import path
import clsx from "clsx"; // Import clsx

interface ExerciseVideoPlayerProps {
	roundedBottomCorners?: boolean;
}

const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = observer(({ roundedBottomCorners }) => {
	const { dialogStore, workoutPageStore } = useStore();

	const activeDialogProps = dialogStore.activeDialog?.props as ExerciseDetailDialogProps | undefined;
	const blockExerciseId = activeDialogProps?.blockExerciseId;

	if (!blockExerciseId) {
		return (
			<div className={clsx(styles.videoPanel, roundedBottomCorners && styles.roundedBottomCorners)}>
				<div className={styles.videoPlaceholder}>Loading video...</div>
			</div>
		);
	}

	const details = workoutPageStore.getFullExerciseDetailsForDialog(blockExerciseId);

	if (!details) {
		return (
			<div className={clsx(styles.videoPanel, roundedBottomCorners && styles.roundedBottomCorners)}>
				<div className={styles.videoPlaceholder}>Video details not available.</div>
			</div>
		);
	}

	const { exerciseName, vimeoCode } = details;

	return (
		<div className={clsx(styles.videoPanel, roundedBottomCorners && styles.roundedBottomCorners)}>
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