import React from "react";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon, CameraIcon } from "@radix-ui/react-icons";
import { useStore } from "../../contexts/StoreContext";
import ExerciseFeedbackDialog from "./ExerciseFeedbackDialog"; // Assuming this is the correct path
import styles from "./ExerciseDetailDialog.module.scss"; // Assuming styles are shared or specific
import type { SupabaseExercise } from "../../lib/types";

interface ExerciseDetailHeaderProps {
  exerciseName: string;
  repsText: string | null;
  isComplete: boolean;
  onToggleComplete: () => void;
  exercise: SupabaseExercise; // For the feedback dialog
  handleCheckboxClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleCheckboxKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const ExerciseDetailHeader: React.FC<ExerciseDetailHeaderProps> = ({
	exerciseName,
	repsText,
	isComplete,
	onToggleComplete, // This might not be directly used if using handleCheckboxClick
	exercise,
	handleCheckboxClick,
	handleCheckboxKeyDown,
}) => {
	const { dialogStore } = useStore();

	return (
		<div className={styles.headerRow}>
			<div className={styles.headerText}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<h2 className={styles.exerciseName}>{exerciseName}</h2>
					<button
						aria-label="Open feedback dialog"
						className={styles.feedbackButton}
						onClick={() =>
							dialogStore.pushDialog(ExerciseFeedbackDialog, { exercise })
						}
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
};

export default ExerciseDetailHeader; 