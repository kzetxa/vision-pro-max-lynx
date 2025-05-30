import React from "react";
// import type { PopulatedBlock } from '../lib/types'; // Old Airtable Type
import type { ExerciseProgress } from "../../lib/localStorage"; // Import ExerciseProgress type
import type { SupabaseBlockExercise, SupabasePopulatedBlock } from "../../lib/types"; // New Supabase Types
import Badge from "../Badge/Badge"; // Import Badge component
import styles from "./BlockViewer.module.scss"; // Import styles
import ExerciseTile from "../ExerciseTile/ExerciseTile";

interface BlockViewerProps {
  // block: PopulatedBlock; // Old Airtable Type
  block: SupabasePopulatedBlock; // New Supabase Type
  blockNumber: number; // Keep block number for display
  workoutId: string; // Added workoutId
  clientId: string;  // Added clientId
  exerciseProgressMap: {[blockExerciseId: string]: ExerciseProgress}; // Added progress map
  onExerciseComplete: (blockExerciseId: string) => void; // Added callback
}

const BlockViewer: React.FC<BlockViewerProps> = ({ 
	block, 
	blockNumber, 
	workoutId, 
	clientId, 
	exerciseProgressMap,
	onExerciseComplete,
}) => {
	// Use Supabase field names
	const blockName = block.public_name || `Block ${blockNumber}`;
	// const setsAndReps = block.fields["Sets & Reps"]; // Old Airtable access
	// Note: Sets/Reps info is now per-exercise in SupabaseIndividualBlock
	const rest = block.rest_between_sets;
	const intensity = block.intensity;
	// const equipment = block.fields["Equipment"]?.join(', '); // Old Airtable access
	// Note: Equipment info is likely on SupabaseExercise now -> block.block_exercises[n].exercise.equipment_public_name
  
	const exercises = block.block_exercises; // Use the array from SupabasePopulatedBlock

	return (
		<div className={styles.blockContainer}>
			<h3 className={styles.title}>{blockName}</h3>
			<div className={styles.infoBadgesContainer}>
				{intensity && <Badge label="Intensity:" value={intensity} />}
				{rest && <Badge label="Rest:" value={rest} />}
			</div>
			{exercises && exercises.length > 0 ? (
				exercises.map((blockExercise: SupabaseBlockExercise) => (
					<ExerciseTile 
						blockExercise={blockExercise} 
						clientId={clientId}   // Pass down 
						initialProgress={exerciseProgressMap[blockExercise.id]}
						key={blockExercise.id}
						onExerciseComplete={onExerciseComplete} // Pass down callback
						workoutId={workoutId} // Pass down 
					/>
				))
			) : (
				<p className={styles.statusMessage}>No exercises found in this block.</p>
			)}
		</div>
	);
};

export default BlockViewer; 