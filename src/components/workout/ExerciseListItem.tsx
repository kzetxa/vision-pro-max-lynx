import React from "react";
import { observer } from "mobx-react-lite";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import type { SupabaseBlockExercise } from "../../lib/types"; // Adjust path
import { parseSetsAndReps } from "../../lib/utils"; // Adjust path
import styles from "./ExerciseListItem.module.scss"; // Use new styles

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
			className={styles.exerciseListItem}
			key={blockExerciseId} // key is usually for parent mapping, but good to have id here 
		>
			<label 
				className={styles.exerciseLabel} 
				htmlFor={`checkbox-${blockExerciseId}`} 
			>
				{exercise.current_name}
			</label>
			{repsText && (
				<span 
					className={styles.repsText} 
				>
					{repsText}
				</span>
			)}
			<Checkbox.Root
				checked={isComplete}
				className={styles.checkboxRoot}
				id={`checkbox-${blockExerciseId}`}
				onCheckedChange={() => onToggleComplete(blockExerciseId, blockExercise)} 
			>
				<Checkbox.Indicator className={styles.checkboxIndicator}>
					<CheckIcon />
				</Checkbox.Indicator>
			</Checkbox.Root>
		</div>
	);
});

export default ExerciseListItem; 