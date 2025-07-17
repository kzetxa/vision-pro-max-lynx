import React from "react";
import type { SupabaseBlockExercise, SupabaseExercise } from "../../lib/types"; // New Supabase Type
import { getDisplayableArrayString, parseSetsAndReps } from "../../lib/utils"; // Import the parser and new utility
import styles from "./ExerciseTile.module.scss"; // Import styles
import Badge from "../Badge/Badge"; // Import Badge component
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";

interface ExerciseTileProps {
  blockExercise: SupabaseBlockExercise;
  isComplete: boolean;
  onExerciseComplete: (blockExerciseId: string) => void;
}

const ExerciseTile: React.FC<ExerciseTileProps> = ({ 
	blockExercise,
	isComplete,
	onExerciseComplete, 
}) => {
	const exercise: SupabaseExercise | null = blockExercise.exercise; 
	const blockExerciseId = blockExercise.id;

	const { sets: parsedSetCount, reps: parsedRepCount } = parseSetsAndReps(blockExercise);

	if (!exercise) {
		return (
			<div className={styles.exerciseTile}>
				<p className={styles.statusMessage}>
                Exercise details not available for this entry (ID: {blockExercise.id}).
				</p>
			</div>
		);
	}

	const exerciseName = exercise.current_name || "Unnamed Exercise";
	const vimeoCode = exercise.vimeo_code;
	const explanation1 = exercise.explanation_1;
  
	// Generate reps text with side information
	let setsRepsTextForDisplay = blockExercise.sets_and_reps_text;
	if (parsedRepCount > 0 && (!blockExercise.unit || blockExercise.unit.toLowerCase().includes("rep") || blockExercise.unit.trim() === "")) {
		setsRepsTextForDisplay = `${parsedRepCount} reps`;
		// Add side information if present in sets_and_reps_text
		if (blockExercise.sets_and_reps_text) {
			const text = blockExercise.sets_and_reps_text.toLowerCase();
			if (text.includes("right side")) {
				setsRepsTextForDisplay += " Right Side";
			} else if (text.includes("left side")) {
				setsRepsTextForDisplay += " Left Side";
			} else if (text.includes("each side")) {
				setsRepsTextForDisplay += " each side";
			}
		}
	}
	const unit = blockExercise.unit;
	const specialInstructions = blockExercise.special_instructions;
	const typeDisplay = getDisplayableArrayString(exercise.over_sort_category);
	const equipmentDisplay = getDisplayableArrayString(exercise.equipment_public_name);

	return (
		<div className={`${styles.exerciseTile} ${isComplete ? styles.exerciseDone : ""}`}>
			<div className={styles.titleContainer}>
				<h5 className={styles.title}>{exerciseName}</h5>
				<div className={styles.checkboxContainer}>
					<RadixCheckbox.Root
						checked={isComplete}
						className={styles.checkboxRoot}
						id={`exercise-complete-${blockExerciseId}`}
						onCheckedChange={() => onExerciseComplete(blockExerciseId)}
					>
						<RadixCheckbox.Indicator className={styles.checkboxIndicator}>
							<CheckIcon />
						</RadixCheckbox.Indicator>
					</RadixCheckbox.Root>
				</div>
			</div>
			<div className={styles.infoBadgesContainer}>
				{setsRepsTextForDisplay && <Badge label="Sets/Reps:" value={setsRepsTextForDisplay} />}
				{unit && <Badge label="Unit:" value={unit} />}
				{typeDisplay && (
					<Badge
						className={styles.typeBadge}
						label="Exercise Type:"
						value={typeDisplay}
					/>
				)}
				{equipmentDisplay && (
					<Badge
						className={styles.equipmentBadge}
						label="Equipment Needed:"
						value={equipmentDisplay}
					/>
				)}
			</div>
			{specialInstructions && (
				<p className={styles.details}> 
					<strong>Notes:</strong> {specialInstructions}
				</p>
			)}
			{vimeoCode && (
				<div className={styles.videoContainer}>
					<iframe 
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen
						className={styles.iframe} 
						frameBorder="0" 
						src={`https://player.vimeo.com/video/${vimeoCode}`}
						title={exerciseName}
					/>
				</div>
			)}
			{explanation1 && (
				<div className={styles.explanationContainer}>
					<p className={styles.explanation}>{explanation1}</p>
				</div>
			)}
			{!(vimeoCode || explanation1) && (
				<p className={styles.statusMessage}>No video or details available.</p>
			)}
			<div className={styles.setsContainer}>
				<p className={styles.setsTitle}>
					{isComplete 
						? `Exercise Complete! (${parsedSetCount} sets of ${parsedRepCount} reps)`
						: `To Do: ${parsedSetCount} sets of ${parsedRepCount} reps`
					}
				</p>
				{isComplete && (
					<p className={styles.completionMessage}>Great job!</p>
				)}
			</div>
		</div>
	);
};

export default ExerciseTile; 