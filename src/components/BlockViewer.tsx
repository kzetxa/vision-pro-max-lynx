import React from 'react';
// import type { PopulatedBlock } from '../lib/types'; // Old Airtable Type
import type { SupabasePopulatedBlock, SupabaseBlockExercise } from '../lib/types'; // New Supabase Types
import ExerciseTile from './ExerciseTile';
import styles from './BlockViewer.module.scss'; // Import styles

interface BlockViewerProps {
  // block: PopulatedBlock; // Old Airtable Type
  block: SupabasePopulatedBlock; // New Supabase Type
  blockNumber: number; // Keep block number for display
}

const BlockViewer: React.FC<BlockViewerProps> = ({ block, blockNumber }) => {
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
      {/* Display block-level info if available */}
       <div className={styles.blockInfo}>
          {intensity && <div>Intensity: {intensity}</div>}
          {rest && <div>Rest Between Sets: {rest}</div>}
          {/* Add other block overview details here if needed */}
       </div>

      {exercises && exercises.length > 0 ? (
        exercises.map((blockExercise: SupabaseBlockExercise) => (
          <ExerciseTile key={blockExercise.id} blockExercise={blockExercise} />
        ))
      ) : (
        <p className={styles.statusMessage}>No exercises found in this block.</p>
      )}
    </div>
  );
};

export default BlockViewer; 