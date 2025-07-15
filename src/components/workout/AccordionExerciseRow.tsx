import React from "react";
import { observer } from "mobx-react-lite";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import type { SupabaseBlockExercise } from "../../lib/types";
import { parseSetsAndReps } from "../../lib/utils";
import styles from "./AccordionExerciseRow.module.scss";
import { useStore } from "../../contexts/StoreContext";
import ExerciseDetailDialog from "../dialogs/ExerciseDetailDialog";

interface AccordionExerciseRowProps {
	blockExercise: SupabaseBlockExercise;
	isComplete: boolean;
	onToggleComplete: () => void;
}

const AccordionExerciseRow: React.FC<AccordionExerciseRowProps> = observer(({
	blockExercise,
	isComplete,
	onToggleComplete,
}) => {
	const { dialogStore } = useStore();
	const exercise = blockExercise.exercise;

	if (!exercise || !exercise.current_name) {
		console.warn("Skipping accordion exercise row due to missing details:", blockExercise);
		return null;
	}

	const parsedRepsInfo = parseSetsAndReps(blockExercise);
	let repsText = "";
	if (parsedRepsInfo.reps > 0 && (!blockExercise.unit || blockExercise.unit.toLowerCase().includes("rep") || blockExercise.unit.trim() === "")) {
		repsText = `${parsedRepsInfo.reps} reps`;
	} else if (blockExercise.sets_and_reps_text) {
		repsText = blockExercise.sets_and_reps_text;
	}

	const handleRowClick = () => {
		if (exercise) {
			dialogStore.pushDialog(ExerciseDetailDialog, {
				blockExerciseId: blockExercise.id,
				exerciseId: exercise.id,
				onToggleComplete: onToggleComplete,
			});
		}
	};

	return (
		<div
			className={styles.accordionExerciseRow}
			onClick={handleRowClick}
		>
			<div className={styles.imageContainer}>
				{exercise.thumbnail ? (
					<img
						alt={exercise.current_name}
						className={styles.actualImage}
						src={exercise.thumbnail}
					/>
				) : (
					<span className={styles.placeholderText}>Image</span>
				)}
			</div>
			<div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
				<span className={styles.exerciseTitle}>{exercise.current_name}</span>
				{parsedRepsInfo.sets > 1 && <span className={styles.exerciseRepsSupportingText}>x {parsedRepsInfo.sets} sets</span>}
			</div>
			<div className={styles.specialContainer}>
				{blockExercise.special_instructions && <span className={styles.specialInstructions}>{blockExercise.special_instructions}</span>}
				{blockExercise.special_instructions && blockExercise.special_set && <div className={styles.separator} />}
				{blockExercise.special_set && <span className={styles.specialSet}>{blockExercise.special_set}</span>}
				{(blockExercise.special_instructions || blockExercise.special_set) && <div className={styles.separator} />}
				{repsText && (
					<span className={styles.exerciseRepsSupportingText}>
						{repsText}
					</span>
				)}
			</div>
			<div onClick={(e) => { e.stopPropagation(); onToggleComplete() }} className={styles.checkboxContainer}>
				<Checkbox.Root
					aria-label={`Mark ${exercise.current_name} as complete`}
					checked={isComplete}
					className={styles.checkboxRoot}
					onCheckedChange={onToggleComplete}
					onClick={(e) => {
						e.stopPropagation();
					}}
					onKeyDown={(e) => {
						if (e.key === " ") {
							e.stopPropagation();
							onToggleComplete();
						}
					}}
				>
					<Checkbox.Indicator className={styles.checkboxIndicator}>
						<CheckIcon />
					</Checkbox.Indicator>
				</Checkbox.Root>
			</div>
		</div>
	);
});

export default AccordionExerciseRow; 