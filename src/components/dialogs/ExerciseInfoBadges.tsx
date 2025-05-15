import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../contexts/StoreContext";
import Badge from "../Badge";
import styles from "./ExerciseDetailDialog.module.scss";
import type { ExerciseDetailDialogProps as ActiveDialogProps } from "./ExerciseDetailDialog"; // To get prop types

// Props are no longer passed to this component directly.
interface ExerciseInfoBadgesProps {}

const ExerciseInfoBadges: React.FC<ExerciseInfoBadgesProps> = observer(() => {
	const { dialogStore, workoutPageStore } = useStore();

	const activeDialogProps = dialogStore.activeDialog?.props as ActiveDialogProps | undefined;
	const blockExerciseId = activeDialogProps?.blockExerciseId;

	if (!blockExerciseId) {
		return <div className={styles.badgesRow}>Loading badges...</div>; // Or null
	}

	const details = workoutPageStore.getFullExerciseDetailsForDialog(blockExerciseId);

	if (!details) {
		return <div className={styles.badgesRow}>Badge data not available.</div>; // Or null
	}

	const { exerciseType, equipmentNeeded } = details;

	if (!exerciseType && !equipmentNeeded) {
		return null; // Don't render the row if there are no badges, consistent with original logic
	}

	return (
		<div className={styles.badgesRow}>
			{exerciseType && (
				<Badge
					className={styles.badge}
					label="Exercise Type"
					value={exerciseType}
				/>
			)}
			{equipmentNeeded && (
				<Badge
					className={styles.badge}
					label="Equipment"
					value={equipmentNeeded}
				/>
			)}
		</div>
	);
});

export default ExerciseInfoBadges;