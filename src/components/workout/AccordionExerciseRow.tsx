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
	const { dialogStore, workoutPageStore, workoutPageStore: { isListView } } = useStore();
	const exercise = blockExercise.exercise;

	if (!exercise || !exercise.current_name) {
		console.warn("Skipping accordion exercise row due to missing details:", blockExercise);
		return null;
	}

	// Helper function to determine current set for special sets
	const getCurrentSetForSpecialSet = (specialSet: string): number => {
		if (!specialSet) return 1;
		return workoutPageStore.getCurrentSetForSpecialSet(specialSet);
	};

	const parsedRepsInfo = parseSetsAndReps(blockExercise);
	let repsText = "";
	if (parsedRepsInfo.reps > 0 && (!blockExercise.unit || blockExercise.unit.toLowerCase().includes("rep") || blockExercise.unit.trim() === "")) {
		repsText = `${parsedRepsInfo.reps} reps`;
		// Handle Half Split Set side display
		if (blockExercise.special_set && blockExercise.special_set.toLowerCase().includes("half split set")) {
			const currentSet = getCurrentSetForSpecialSet(blockExercise.special_set);
			if (currentSet === 0) {
				repsText += " Left Side";
			} else {
				repsText += " Right Side";
			}
		} else if (blockExercise.sets_and_reps_text) {
			// Add side information if present in sets_and_reps_text for non-special sets
			const text = blockExercise.sets_and_reps_text.toLowerCase();
			if (text.includes("right side")) {
				repsText += " Right Side";
			} else if (text.includes("left side")) {
				repsText += " Left Side";
			} else if (text.includes("each side")) {
				repsText += " each side";
			}
		}
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
			// disable if exercise is complete
			style={{ opacity: isComplete ? 0.5 : 1 }}
			onClick={isComplete ? undefined : handleRowClick}
		>
			{blockExercise.special_set && (
				<div className={styles.leadingIndicator}>
					<div className={styles.greenBullet} />
				</div>
			)}
			{!isListView && (
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
			)}
			<div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<span className={styles.exerciseTitle}>{exercise.current_name}</span>
					{!blockExercise.special_set && blockExercise.sets && blockExercise.sets > 1 && (
						<span className={styles.setsText}>{blockExercise.sets} sets</span>
					)}
				</div>
			</div>
			<div className={styles.specialContainer}>
				{blockExercise.special_instructions && <span className={styles.specialInstructions}>{blockExercise.special_instructions}</span>}
				{blockExercise.special_instructions && repsText && <div className={styles.separator} />}
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