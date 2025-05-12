import React, { useState, useEffect, useMemo } from 'react';
// import type { Exercise } from '../lib/types'; // Old Airtable Type
import type { SupabaseBlockExercise, SupabaseExercise } from '../lib/types'; // New Supabase Type
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as RadixTabs from '@radix-ui/react-tabs';
import { CheckIcon } from '@radix-ui/react-icons';
import styles from './ExerciseTile.module.scss'; // Import styles
import { parseSetsAndReps } from '../lib/utils'; // Import the parser
// import * as Checkbox from '@radix-ui/react-checkbox'; // Will add later
// import { CheckIcon } from '@radix-ui/react-icons'; // Will add later for checkbox

interface ExerciseTileProps {
  // exercise: Exercise; // Old Airtable Type
  blockExercise: SupabaseBlockExercise; // New Supabase Type
  // onCompletionChange?: (exerciseId: string, setId: string | number, completed: boolean) => void; // Will need update for Supabase IDs
  // Add a callback for when the entire exercise is completed
  onExerciseComplete?: (blockExerciseId: string) => void;
}

const ExerciseTile: React.FC<ExerciseTileProps> = ({ blockExercise, onExerciseComplete }) => {
  // Extract exercise details from the nested exercise object
  const exercise: SupabaseExercise | null = blockExercise.exercise; 

  // Parse sets and reps using the utility function
  // useMemo will ensure this parsing only happens if blockExercise changes
  const { sets: parsedSetCount, reps: parsedRepCount } = useMemo(() => 
    parseSetsAndReps(blockExercise)
  , [blockExercise]);

  const [currentSet, setCurrentSet] = useState<number>(1);
  // State for reps completed in the *current* set
  const [repsCompleted, setRepsCompleted] = useState<boolean[]>(() => 
    Array(parsedRepCount).fill(false)
  );
  // Add state to track if the whole exercise is done
  const [isExerciseDone, setIsExerciseDone] = useState<boolean>(false);

  // Effect to reset repsCompleted when parsedRepCount or currentSet changes
  useEffect(() => {
    // Only reset if the exercise isn't marked as done
    if (!isExerciseDone) {
      setRepsCompleted(Array(parsedRepCount).fill(false));
    }
  }, [parsedRepCount, currentSet, isExerciseDone]); 

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
  const exerciseName = exercise.current_name || 'Unnamed Exercise';
  const muscleWorked = exercise.equipment_public_name || 'N/A'; // Assuming this is the primary muscle field now?
  const vimeoCode = exercise.vimeo_code;
  // Use Supabase explanation fields
  const explanation1 = exercise.explanation_1;
  
  // Get sets/reps from blockExercise (individual block data)
  const setsRepsTextForDisplay = blockExercise.sets_and_reps_text;
  const unit = blockExercise.unit;
  const specialInstructions = blockExercise.special_instructions;

  const [activeTab, setActiveTab] = useState(vimeoCode ? 'video' : (explanation1 ? 'details' : ''));

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
        setCurrentSet(prevSet => prevSet + 1); 
      } else {
        // Last set completed
        console.log(`All sets complete for ${exercise?.current_name}!`);
        setIsExerciseDone(true);
        // Call the completion callback if provided
        onExerciseComplete?.(blockExercise.id);
      }
    }
  };

  return (
    // Add a class if the exercise is done for potential styling
    <div className={`${styles.exerciseTile} ${isExerciseDone ? styles.exerciseDone : ''}`}>
      <h5 className={styles.title}>{exerciseName}</h5>
      {/* Display Sets/Reps/Unit/Instructions if available */}
      <div className={styles.details}>
          {setsRepsTextForDisplay && <div>Sets/Reps: {setsRepsTextForDisplay}</div>}
          {/* Optionally display parsed counts: <div>Parsed: {parsedSetCount} sets of {parsedRepCount} reps</div> */}
          {unit && <div>Unit: {unit}</div>}
          {muscleWorked !== 'N/A' && <div>Muscle: {muscleWorked}</div>}
          {specialInstructions && <div>Notes: {specialInstructions}</div>}
      </div>
      
      {(vimeoCode || explanation1) && (
        <RadixTabs.Root defaultValue={activeTab} onValueChange={setActiveTab}>
          <RadixTabs.List className={styles.tabsList}>
            {vimeoCode && (
              <RadixTabs.Trigger value="video" className={styles.tabsTrigger}>
                Video
              </RadixTabs.Trigger>
            )}
            {explanation1 && (
              <RadixTabs.Trigger value="details" className={styles.tabsTrigger}>
                Details
              </RadixTabs.Trigger>
            )}
          </RadixTabs.List>

          {vimeoCode && (
            <RadixTabs.Content value="video">
              <div className={styles.videoContainer}>
                <iframe 
                  className={styles.iframe}
                  src={`https://player.vimeo.com/video/${vimeoCode}`}
                  frameBorder="0" 
                  allow="autoplay; fullscreen; picture-in-picture" 
                  allowFullScreen
                  title={exerciseName}
                ></iframe>
              </div>
            </RadixTabs.Content>
          )}
          {explanation1 && (
            <RadixTabs.Content value="details">
              <p className={styles.explanation}>{explanation1}</p>
            </RadixTabs.Content>
          )}
        </RadixTabs.Root>
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
          <div key={`rep-${repIndex}`} className={styles.setRow}>
            <RadixCheckbox.Root
              id={`rep-${blockExercise.id}-${currentSet}-${repIndex}`}
              checked={isCompleted}
              onCheckedChange={() => handleRepCompletion(repIndex)}
              className={styles.checkboxRoot}
              disabled={isExerciseDone} // Disable checkbox when done
            >
              <RadixCheckbox.Indicator className={styles.checkboxIndicator}>
                <CheckIcon />
              </RadixCheckbox.Indicator>
            </RadixCheckbox.Root>
            <label htmlFor={`rep-${blockExercise.id}-${currentSet}-${repIndex}`} className={styles.setLabel}>
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