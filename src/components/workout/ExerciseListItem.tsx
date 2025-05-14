import React from "react";
import { observer } from "mobx-react-lite";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import type { SupabaseBlockExercise } from "../../lib/types"; // Adjust path
import { parseSetsAndReps } from "../../lib/utils"; // Adjust path
import styles from "../../pages/WorkoutPage.module.scss"; // Use existing styles

interface ExerciseListItemProps {
    blockExercise: SupabaseBlockExercise;
    isComplete: boolean;
    onToggleComplete: (blockExerciseId: string, exerciseDefinition: SupabaseBlockExercise) => void;
}

const ExerciseListItem: React.FC<ExerciseListItemProps> = observer(({ 
	blockExercise,
	isComplete,
	onToggleComplete, 
}) => {
	const exercise = blockExercise.exercise;

	if (!exercise || !exercise.current_name) {
		console.warn("Skipping exercise in list due to missing details or name:", blockExercise);
		return null; 
	}

	const blockExerciseId = blockExercise.id;
	const parsedRepsInfo = parseSetsAndReps(blockExercise);
	let repsText = "";
	if (parsedRepsInfo.reps > 0 && (!blockExercise.unit || blockExercise.unit.toLowerCase().includes("rep") || blockExercise.unit.trim() === "")) {
		repsText = `${parsedRepsInfo.reps} reps`;
	} else if (blockExercise.sets_and_reps_text) {
		repsText = blockExercise.sets_and_reps_text;
	}

	return (
		<div 
			className={styles.listViewExercise}
			key={blockExerciseId} // key is usually for parent mapping, but good to have id here 
			style={{ display: "flex", alignItems: "center", padding: "0.5rem 0" }}
		>
			<label 
				className={styles.listViewExerciseLabel} 
				htmlFor={`checkbox-${blockExerciseId}`} 
				style={{ flexGrow: 1, cursor: "pointer" }}
			>
				{exercise.current_name}
			</label>
			{repsText && (
				<span 
					className={styles.listViewRepsText} 
					style={{ paddingLeft: "1em", paddingRight: "1em", fontSize: "0.9em", color: "#555", whiteSpace: "nowrap" }}
				>
					{repsText}
				</span>
			)}
			<Checkbox.Root
				checked={isComplete}
				className={styles.modernCheckboxRoot}
				id={`checkbox-${blockExerciseId}`}
				onCheckedChange={() => onToggleComplete(blockExerciseId, blockExercise)} 
				style={{ 
					width: 20, height: 20, borderRadius: 4, border: "1px solid #ccc", 
					display: "flex", alignItems: "center", justifyContent: "center",
					cursor: "pointer",
				}}
			>
				<Checkbox.Indicator className={styles.modernCheckboxIndicator}>
					<CheckIcon />
				</Checkbox.Indicator>
			</Checkbox.Root>
		</div>
	);
});

export default ExerciseListItem; 