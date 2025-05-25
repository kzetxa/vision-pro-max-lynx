import React from "react";
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

	if (!blockExerciseId) {
		console.warn("ExerciseDetailDialog: blockExerciseId is missing from dialog props.");
		return <div className={styles.dialogOverlay}><div className={styles.dialogContent}>Loading details...</div></div>; 
	}

	const details = workoutPageStore.getFullExerciseDetailsForDialog(blockExerciseId);

	if (!details) {
		console.warn(`ExerciseDetailDialog: Details not found for blockExerciseId: ${blockExerciseId}`);
		return <div className={styles.dialogOverlay}><div className={styles.dialogContent}>Details not available.</div></div>; 
	}

	const { description } = details;

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
				</div>
			</div>
		</div>
	);
});

export default ExerciseDetailDialog; 