import React from "react";
import { observer } from "mobx-react-lite";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon, CameraIcon } from "@radix-ui/react-icons";
import { useStore } from "../../contexts/StoreContext";
import ExerciseFeedbackDialog from "./ExerciseFeedbackDialog";
import styles from "./ExerciseDetailDialog.module.scss";
import type { ExerciseDetailDialogProps as ActiveDialogProps } from "./ExerciseDetailDialog"; // To get prop types
// SupabaseExercise type might still be needed if ExerciseFeedbackDialog expects it and it's not part of details

// Props are no longer passed to this component directly.
interface ExerciseDetailHeaderProps {}

const ExerciseDetailHeader: React.FC<ExerciseDetailHeaderProps> = observer(() => {
	const { dialogStore, workoutPageStore } = useStore();

	const activeDialogProps = dialogStore.activeDialog?.props as ActiveDialogProps | undefined;
	const blockExerciseId = activeDialogProps?.blockExerciseId;

	if (!blockExerciseId) {
		return <div className={styles.headerRow}>Loading header...</div>; // Or some placeholder
	}

	const details = workoutPageStore.getFullExerciseDetailsForDialog(blockExerciseId);

	if (!details || !details.exercise || !details.blockExercise) {
		// Ensure exercise and blockExercise are present for feedback dialog and toggle action
		return <div className={styles.headerRow}>Header data not available.</div>;
	}

	const { exerciseName, repsText, isComplete, exercise, blockExercise } = details;

	const handleToggleCompletion = () => {
		// Call the store action to toggle completion
		// The existing action `handleToggleExerciseCompleteList` takes blockExerciseId and the exerciseDefinition
		workoutPageStore.handleToggleExerciseCompleteList(blockExerciseId, blockExercise);
	};

	const handleCheckboxClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		e.stopPropagation();
		handleToggleCompletion();
	};

	const handleCheckboxKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (e.key === " " || e.key === "Enter") {
			e.stopPropagation();
			handleToggleCompletion();
		}
	};

	const handleFeedbackButtonClick = () => {
		// Ensure exercise object is available before pushing dialog
		dialogStore.pushDialog(ExerciseFeedbackDialog, { exercise }, true);
	};

	return (
		<div className={styles.headerRow}>
			<div className={styles.headerText}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<h2 className={styles.exerciseName}>{exerciseName}</h2>
					<button
						aria-label="Open feedback dialog"
						className={styles.feedbackButton}
						onClick={handleFeedbackButtonClick}
					>
						<CameraIcon />
					</button>
				</div>
				{repsText && <p className={styles.repsText}>{repsText}</p>}
			</div>
			<Checkbox.Root
				aria-label={`Mark ${exerciseName} as complete`}
				checked={isComplete}
				className={styles.completionCheckboxRoot}
				onClick={handleCheckboxClick}
				onKeyDown={handleCheckboxKeyDown}
			>
				<Checkbox.Indicator className={styles.completionCheckboxIndicator}>
					<CheckIcon />
				</Checkbox.Indicator>
			</Checkbox.Root>
		</div>
	);
});

export default ExerciseDetailHeader; 