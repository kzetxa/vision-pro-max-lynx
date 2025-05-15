import React from "react";
import { observer } from "mobx-react-lite";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon, Cross2Icon, CameraIcon } from "@radix-ui/react-icons";
import { useStore } from "../../contexts/StoreContext";
import type { SupabaseExercise, SupabaseBlockExercise } from "../../lib/types";
import { parseSetsAndReps, getDisplayableArrayString } from "../../lib/utils";
import Badge from "../Badge"; // Assuming Badge component path
import styles from "./ExerciseDetailDialog.module.scss";
import ExerciseFeedbackDialog from "./ExerciseFeedbackDialog"; // Added for the new dialog
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";
import ExerciseDetailHeader from "./ExerciseDetailHeader";
import ExerciseInfoBadges from "./ExerciseInfoBadges";

export interface ExerciseDetailDialogProps {
  exercise: SupabaseExercise;
  blockExercise: SupabaseBlockExercise;
  isComplete: boolean;
  onToggleComplete: () => void;
  // workoutId: string; // Potentially needed for more complex state interactions later
  // clientId: string;  // Potentially needed for more complex state interactions later
}

const ExerciseDetailDialog: React.FC<ExerciseDetailDialogProps> = observer(
	({ exercise, blockExercise, isComplete, onToggleComplete }) => {
		const { dialogStore } = useStore();

		const exerciseName = exercise.current_name || "Unnamed Exercise";
		const vimeoCode = exercise.vimeo_code;

		// Reps and Sets text (similar to AccordionExerciseRow)
		const parsedRepsInfo = parseSetsAndReps(blockExercise);
		let repsText = "";
		if (parsedRepsInfo.reps > 0 && (!blockExercise.unit || blockExercise.unit.toLowerCase().includes("rep") || blockExercise.unit.trim() === "")) {
			repsText = `${parsedRepsInfo.reps} reps`;
			if (blockExercise.sets_and_reps_text && blockExercise.sets_and_reps_text.toLowerCase().includes("left side")) {
				repsText += " Left Side";
			} else if (blockExercise.sets_and_reps_text && blockExercise.sets_and_reps_text.toLowerCase().includes("right side")) {
				repsText += " Right Side";
			}
			// Add "each side" if present
			else if (blockExercise.sets_and_reps_text && blockExercise.sets_and_reps_text.toLowerCase().includes("each side")) {
				repsText += " each side";
			}
		} else if (blockExercise.sets_and_reps_text) {
			repsText = blockExercise.sets_and_reps_text;
		}


		const description = [
			exercise.explanation_1,
			exercise.explanation_2,
			exercise.explanation_3,
			exercise.explanation_4,
		]
			.filter(Boolean)
			.join(" ");

		const exerciseType = getDisplayableArrayString(exercise.over_sort_category);
		const equipmentNeeded = getDisplayableArrayString(exercise.equipment_public_name);

		const handleCheckboxClick = (e: React.MouseEvent) => {
			e.stopPropagation(); // Prevent dialog close if clicking on checkbox overlay
			onToggleComplete();
		};
    
		const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
			if (e.key === " " || e.key === "Enter") {
				e.stopPropagation();
				onToggleComplete();
			}
		};


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
					{/* Video Panel */}
					<ExerciseVideoPlayer exerciseName={exerciseName} vimeoCode={vimeoCode} />
					{/* Bottom Panel: Details */}
					<div className={styles.detailsPanel}>
						<ExerciseDetailHeader
							exercise={exercise}
							exerciseName={exerciseName}
							handleCheckboxClick={handleCheckboxClick}
							handleCheckboxKeyDown={handleCheckboxKeyDown}
							isComplete={isComplete}
							onToggleComplete={onToggleComplete}
							repsText={repsText}
						/>
						{description && (
							<p className={styles.description}>{description}</p>
						)}
						<ExerciseInfoBadges 
							equipmentNeeded={equipmentNeeded} 
							exerciseType={exerciseType} 
						/>
					</div>
				</div>
			</div>
		);
	},
);

export default ExerciseDetailDialog; 