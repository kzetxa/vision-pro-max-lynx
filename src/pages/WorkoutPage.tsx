import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import BlockViewer from '../components/BlockViewer';
// import CompletionChart from '../components/CompletionChart'; // Keep for later
import { fetchWorkoutDetailsById } from '../lib/api';
import type { SupabasePopulatedWorkout } from '../lib/types';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import styles from './WorkoutPage.module.scss'; // Import styles
import {
  loadWorkoutProgressFromStorage,
  saveExerciseProgressToStorage, // We'll use this in ExerciseTile, but good to have it imported if needed here later
  ExerciseProgress,
  clearWorkoutProgressInStorage
} from '../lib/localStorage';

const WorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const clientId = "test"; // Force client ID to "test"

  const [workoutData, setWorkoutData] = useState<SupabasePopulatedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false); // Keep for later
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  // State to hold progress for all exercises in this workout
  const [allExerciseProgress, setAllExerciseProgress] = useState<{[blockExerciseId: string]: ExerciseProgress}>({}); 

  useEffect(() => {
    if (!workoutId) {
      setError('Workout ID is missing from URL.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWorkoutDetailsById(workoutId);
        if (data) {
          setWorkoutData(data);
          // Once workout data is loaded, load its progress
          if (clientId) { // Ensure clientId is available
            const progress = loadWorkoutProgressFromStorage(workoutId, clientId);
            setAllExerciseProgress(progress);
          }
        } else {
          setError('Workout not found.');
        }
      } catch (err) {
        console.error("Error fetching workout details:", err);
        setError(err instanceof Error ? err.message : 'Failed to load workout details');
      }
      setLoading(false);
    };
    loadData();
  }, [workoutId]); // clientId is stable, so not needed as dependency

  const handleExerciseCompleteInPage = useCallback((blockExerciseId: string) => {
    console.log(`Exercise ${blockExerciseId} completed in WorkoutPage for workout ${workoutId}, client ${clientId}`);
    // Here you could check if ALL exercises in workoutData.blocks are complete
    // and then perhaps prompt the user or auto-mark the workout as finished.
    // For now, we just log it and ensure the individual exercise progress is saved by ExerciseTile.
  }, [workoutId, clientId]);

  const handleFinishWorkout = () => {
    console.log(`Finish workout button clicked for: ${workoutId}, client: ${clientId}`);
    // Potentially clear progress when workout is manually marked as finished
    if (workoutId && clientId) {
        clearWorkoutProgressInStorage(workoutId, clientId);
        // Optionally, re-fetch or clear local state to reflect this on the UI immediately
        setAllExerciseProgress({}); 
        alert("Workout progress cleared!");
    }
    setIsFinishDialogOpen(false);
  };

  if (loading) {
    return <p className={styles.statusMessage}>Loading workout...</p>;
  }

  if (error) {
    return <p className={styles.errorStatus}>Error: {error}</p>;
  }

  if (!workoutData) {
    return <p className={styles.statusMessage}>Workout data could not be loaded.</p>;
  }

  const workoutTitle = workoutData.public_workout_title || 'Workout Plan';

  return (
    <div className={styles.workoutPageContainer}>
      <h2 className={styles.title}>{workoutTitle}</h2>
      {clientId && <p className={styles.clientId}>Client ID: {clientId}</p>}

      {!showChart ? (
        <>
          <h3 className={styles.blocksHeader}>Workout Blocks:</h3>
          {workoutData.blocks && workoutData.blocks.length > 0 ? (
            workoutData.blocks.map((block, index) => (
              <BlockViewer 
                key={block.id} 
                block={block} 
                blockNumber={index + 1} 
                workoutId={workoutId!} // workoutId is guaranteed to be present here
                clientId={clientId} 
                exerciseProgressMap={allExerciseProgress} // Pass the whole map
                onExerciseComplete={handleExerciseCompleteInPage} // Pass down callback
              />
            ))
          ) : (
            <p className={styles.statusMessage}>No blocks found for this workout.</p>
          )}
          
          <RadixDialog.Root open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
            <RadixDialog.Trigger asChild>
              <button className={`${styles.dialogButton} ${styles.dialogButtonPrimary}`} style={{margin: '2rem auto', display: 'block'}}>
                Finish Workout (Clear Progress)
              </button>
            </RadixDialog.Trigger>
            <RadixDialog.Portal>
              <RadixDialog.Overlay className={styles.dialogOverlay} />
              <RadixDialog.Content className={styles.dialogContent}>
                <RadixDialog.Title className={styles.dialogTitle}>Confirm Finish & Clear</RadixDialog.Title>
                <RadixDialog.Description className={styles.dialogDescription}>
                  Are you sure? This will mark the workout as finished and clear your current progress for it.
                </RadixDialog.Description>
                <div className={styles.dialogActions}>
                  <RadixDialog.Close asChild>
                    <button className={`${styles.dialogButton} ${styles.dialogButtonSecondary}`}>
                        Cancel
                    </button>
                  </RadixDialog.Close>
                  <button 
                    onClick={handleFinishWorkout} 
                    className={`${styles.dialogButton} ${styles.dialogButtonPrimary}`}
                  >
                    Yes, Finish & Clear
                  </button>
                </div>
                <RadixDialog.Close asChild>
                  <button className={styles.dialogCloseButton} aria-label="Close">
                    <Cross2Icon />
                  </button>
                </RadixDialog.Close>
              </RadixDialog.Content>
            </RadixDialog.Portal>
          </RadixDialog.Root>
        </>
      ) : (
        // <CompletionChart workoutData={workoutData} /> // For later
        <p className={styles.statusMessage}>Chart will be shown here.</p>
      )}
    </div>
  );
};

export default WorkoutPage; 