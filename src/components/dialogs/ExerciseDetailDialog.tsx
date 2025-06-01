import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useStore } from "../../contexts/StoreContext";
import styles from "./ExerciseDetailDialog.module.scss";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer/ExerciseVideoPlayer";
import ExerciseDetailHeader from "./ExerciseDetailHeader";
import ExerciseInfoBadges from "./ExerciseInfoBadges";

export interface ExerciseDetailDialogProps { 
  blockExerciseId?: string;
  exerciseId?: string;
}

const ExerciseDetailDialog: React.FC<ExerciseDetailDialogProps> = observer(() => {
	const { dialogStore, workoutPageStore } = useStore();
	
	const activeDialogProps = dialogStore.activeDialog?.props as ExerciseDetailDialogProps;
	const blockExerciseId = activeDialogProps?.blockExerciseId;

	// Call an expensive getter once
	const details = blockExerciseId ? workoutPageStore.getFullExerciseDetailsForDialog(blockExerciseId) : null;

	// Effect to fetch audio
	useEffect(() => {
		if (details && details.exercise && details.exercise.id && details.description) {
			workoutPageStore.fetchAndSetExerciseAudio(details.exercise.id, details.description);
		} else if (blockExerciseId) { // Only warn or clear if blockExerciseId was present but details were not sufficient
			// console.warn("Cannot fetch audio: Missing exercise ID or description in details for blockExerciseId:", blockExerciseId);
			workoutPageStore._setCurrentExerciseAudioUrl(null);
			workoutPageStore._setAudioLoading(false);
		}

		return () => {
			// console.log("Cleaning up audio URL from ExerciseDetailDialog");
			workoutPageStore._setCurrentExerciseAudioUrl(null);
			workoutPageStore._setAudioLoading(false);
		};
		// Depend on the specific details needed for fetching audio and blockExerciseId itself.
		// workoutPageStore is stable, but including it is good practice if its methods were not bound `action.bound`
	}, []);

	if (!blockExerciseId) {
		console.warn("ExerciseDetailDialog: blockExerciseId is missing from dialog props.");
		return <div className={styles.dialogOverlay}><div className={styles.dialogContent}>Loading details...</div></div>; 
	}

	if (!details) {
		console.warn(`ExerciseDetailDialog: Details not found for blockExerciseId: ${blockExerciseId}`);
		return <div className={styles.dialogOverlay}><div className={styles.dialogContent}>Details not available.</div></div>; 
	}

	const { description } = details;
	const { currentExerciseAudioUrl, isAudioLoading } = workoutPageStore;

	return (
		<div className={styles.dialogOverlay} onClick={() => dialogStore.popDialog()}>
			<div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
				<button
					aria-label="Close dialog"
					className={styles.closeButton}
					onClick={() => dialogStore.popDialog()}
				>
					<Cross2Icon />
				</button>
				<ExerciseVideoPlayer />
				<div className={styles.detailsPanel}>
					<ExerciseDetailHeader />
					{description && (
						<p className={styles.description}>{description}</p>
					)}
					<ExerciseInfoBadges />
					{isAudioLoading && <p>Loading audio...</p>}
					{currentExerciseAudioUrl && (
						<div>
							<p>Audio URL: <a
								href={currentExerciseAudioUrl}
								rel="noopener noreferrer"
								target="_blank"
							              >{currentExerciseAudioUrl}</a></p>
						</div>
					)}
					{!isAudioLoading && !currentExerciseAudioUrl && details && details.exercise && <p>No audio loaded or available.</p>}

				</div>
			</div>
		</div>
	);
});

export default ExerciseDetailDialog; 