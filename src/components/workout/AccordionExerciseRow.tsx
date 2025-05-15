import React from "react";
import { observer } from "mobx-react-lite";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import type { SupabaseBlockExercise, SupabaseExercise } from "../../lib/types";
import { parseSetsAndReps } from "../../lib/utils";
import styles from "../../pages/WorkoutPage.module.scss";
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
	const { dialogStore, workoutPageStore } = useStore();
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

	const thumbnailStyle: React.CSSProperties = {
		width: 60,
		height: 60,
		borderRadius: 8,
		backgroundColor: "#e0e0e0",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		marginRight: "1rem",
		fontSize: "0.8em",
		color: "#555",
		textAlign: "center",
	};

	const handleRowClick = () => {
		if (exercise) {
			dialogStore.pushDialog(ExerciseDetailDialog, { 
				blockExerciseId: blockExercise.id,
				exerciseId: exercise.id,
			});
		}
	};

	return (
		<div 
			className={styles.accordionExerciseRow}
			onClick={handleRowClick}
			style={{ display: "flex", alignItems: "center", padding: "0.75rem 0", cursor: "pointer" }}
		>
			<div style={thumbnailStyle}>Image</div>
			<div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
				<span className={styles.exerciseTitle}>{exercise.current_name}</span>
				{repsText && (
					<span className={styles.exerciseRepsSupportingText} style={{ color: "#888", fontSize: "0.9em" }}>
						{repsText}
					</span>
				)}
			</div>
			<Checkbox.Root
				aria-label={`Mark ${exercise.current_name} as complete`}
				checked={isComplete}
				className={styles.modernCheckboxRoot}
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
				style={{ 
					width: 20, height: 20, borderRadius: 4, border: "1px solid #ccc", 
					display: "flex", alignItems: "center", justifyContent: "center",
					marginLeft: "1rem",
				}}
			>
				<Checkbox.Indicator className={styles.modernCheckboxIndicator}>
					<CheckIcon />
				</Checkbox.Indicator>
			</Checkbox.Root>
		</div>
	);
});

export default AccordionExerciseRow; 