import React, { useState, useEffect, useMemo } from "react";
// import type { Exercise } from '../lib/types'; // Old Airtable Type
import type { SupabaseBlockExercise, SupabaseExercise } from "../lib/types"; // New Supabase Type
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import * as RadixTabs from "@radix-ui/react-tabs";
import { CheckIcon } from "@radix-ui/react-icons";
import styles from "./ExerciseTile.module.scss"; // Import styles
import { parseSetsAndReps } from "../lib/utils"; // Import the parser
// import * as Checkbox from '@radix-ui/react-checkbox'; // Will add later
// import { CheckIcon } from '@radix-ui/react-icons'; // Will add later for checkbox
// Import storage functions and type
import {
	saveExerciseProgressToStorage,
	ExerciseProgress 
} from "../lib/localStorage"; 
import Badge from "./Badge"; // Import Badge component

interface ExerciseTileProps {
  // exercise: Exercise; // Old Airtable Type
  blockExercise: SupabaseBlockExercise; // New Supabase Type
  workoutId: string; // Added
  clientId: string;  // Added
  initialProgress?: ExerciseProgress; // Added optional initial progress
  // onCompletionChange?: (exerciseId: string, setId: string | number, completed: boolean) => void; // Will need update for Supabase IDs
  // Add a callback for when the entire exercise is completed
  onExerciseComplete?: (blockExerciseId: string) => void;
}

const ExerciseTile: React.FC<ExerciseTileProps> = ({ 
	blockExercise, 
	workoutId, 
	clientId, 
	initialProgress, 
	onExerciseComplete, 
}) => {
	// Extract exercise details from the nested exercise object
	const exercise: SupabaseExercise | null = blockExercise.exercise; 
	const blockExerciseId = blockExercise.id;

	// Parse sets and reps using the utility function
	// useMemo will ensure this parsing only happens if blockExercise changes
	const { sets: parsedSetCount, reps: parsedRepCount } = useMemo(() => 
		parseSetsAndReps(blockExercise)
	, [blockExercise]);

	// Load initial state from props or default
	const [currentSet, setCurrentSet] = useState<number>(initialProgress?.currentSet ?? 1);
	const [isExerciseDone, setIsExerciseDone] = useState<boolean>(initialProgress?.isExerciseDone ?? false);
	// RepsCompleted state is transient for the current set, doesn't need loading/saving directly here
	const [repsCompleted, setRepsCompleted] = useState<boolean[]>(() => 
		Array(parsedRepCount).fill(false),
	);

	// Effect to reset repsCompleted when parsedRepCount or currentSet changes
	useEffect(() => {
		// Only reset if the exercise isn't marked as done
		if (!isExerciseDone) {
			setRepsCompleted(Array(parsedRepCount).fill(false));
		}
	}, [parsedRepCount, currentSet, isExerciseDone]); 

	// Effect to save progress whenever currentSet or isExerciseDone changes
	useEffect(() => {
		// Don't save initial default state before any interaction potentially happens
		// Or, alternatively, load progress in WorkoutPage and only pass it down if it exists
		// For simplicity now, we save whenever these change after initial load.
		if (workoutId && clientId && blockExerciseId) {
			const progress: ExerciseProgress = { currentSet, isExerciseDone };
			saveExerciseProgressToStorage(workoutId, clientId, blockExerciseId, progress);
		}
	}, [currentSet, isExerciseDone, workoutId, clientId, blockExerciseId]);

	if (!exercise) {
		// Handle case where exercise data might be missing (though unlikely with the current query)
		return (
			<div className={styles.exerciseTile}>
				<p className={styles.statusMessage}>
                Exercise details not available for this entry (ID: {blockExercise.id}).
				</p>
			</div>
		);
	}

	// Use Supabase field names from the exercise object
	const exerciseName = exercise.current_name || "Unnamed Exercise";
	const muscleWorked = exercise.equipment_public_name || "N/A"; // TODO: Revisit if this is the correct field
	const vimeoCode = exercise.vimeo_code;
	// Use Supabase explanation fields
	const explanation1 = exercise.explanation_1;
  
	// Get sets/reps from blockExercise (individual block data)
	const setsRepsTextForDisplay = blockExercise.sets_and_reps_text;
	const unit = blockExercise.unit;
	const specialInstructions = blockExercise.special_instructions;

	// Helper to parse potentially stringified arrays
	const getDisplayableArrayString = (data: string | null | undefined): string => {
		if (!data) return "";
		try {
			// Check if it looks like a stringified array (basic check)
			if (data.startsWith("[") && data.endsWith("]")) {
				const parsed = JSON.parse(data);
				return Array.isArray(parsed) ? parsed.join(", ") : data;
			}
		} catch (e) {
			// If parsing fails, return the original string
			console.error("Failed to parse array string:", data, e);
			return data;
		}
		// Return original data if not detected as stringified array
		return data;
	};

	const typeDisplay = getDisplayableArrayString(exercise.over_sort_category);
	const equipmentDisplay = getDisplayableArrayString(exercise.equipment_public_name);

	const handleRepCompletion = (repIndex: number) => {
		// Prevent changes if exercise is already done
		if (isExerciseDone) return;

		const newRepsCompleted = [...repsCompleted];
		newRepsCompleted[repIndex] = !newRepsCompleted[repIndex];
		setRepsCompleted(newRepsCompleted);

		// Check if all reps in *this* set are now complete
		const allRepsDoneForSet = newRepsCompleted.every(Boolean);

		if (allRepsDoneForSet) {
			if (currentSet < parsedSetCount) {
				// Advance to the next set
				console.log(`Set ${currentSet} complete for ${exercise?.current_name}. Advancing to next set.`);
				// Resetting reps is handled by the useEffect listening to currentSet change
				setCurrentSet((prevSet) => prevSet + 1); 
			} else {
				// Last set completed
				console.log(`All sets complete for ${exercise?.current_name}!`);
				setIsExerciseDone(true);
				// Call the completion callback if provided
				onExerciseComplete?.(blockExerciseId);
			}
		}
	};

	return (
	// Add a class if the exercise is done for potential styling
		<div className={`${styles.exerciseTile} ${isExerciseDone ? styles.exerciseDone : ""}`}>
			<h5 className={styles.title}>{exerciseName}</h5>
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
				<div className={styles.explanationContainer}> {/* New container for styling */} 
					<p className={styles.explanation}>{explanation1}</p>
				</div>
			)}
			{!(vimeoCode || explanation1) && (
				<p className={styles.statusMessage}>No video or details available.</p>
			)}
			{/* Updated Set and Rep Tracking Section */}
			<div className={styles.setsContainer}>
				<p className={styles.setsTitle}>
					{/* Indicate completion status */}
					{isExerciseDone 
						? `Exercise Complete! (${parsedSetCount} sets of ${parsedRepCount} reps)`
						: `Set ${currentSet} of ${parsedSetCount} (Reps: ${parsedRepCount})`
					}
				</p>
				{/* Only show reps if the exercise isn't done */}
				{!isExerciseDone && repsCompleted.map((isCompleted, repIndex) => (
					<div className={styles.setRow} key={`rep-${repIndex}`}>
						<RadixCheckbox.Root
							checked={isCompleted}
							className={styles.checkboxRoot}
							disabled={isExerciseDone} // Disable checkbox when done
							id={`rep-${blockExerciseId}-${currentSet}-${repIndex}`}
							onCheckedChange={() => handleRepCompletion(repIndex)}
						>
							<RadixCheckbox.Indicator className={styles.checkboxIndicator}>
								<CheckIcon />
							</RadixCheckbox.Indicator>
						</RadixCheckbox.Root>
						<label className={styles.setLabel} htmlFor={`rep-${blockExerciseId}-${currentSet}-${repIndex}`}>
              Rep {repIndex + 1}
						</label>
					</div>
				))}
				{isExerciseDone && (
					<p className={styles.completionMessage}>Great job!</p>
				)}
			</div>
		</div>
	);
};

export default ExerciseTile; 