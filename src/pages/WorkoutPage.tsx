import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BlockViewer from '../components/BlockViewer';
// import CompletionChart from '../components/CompletionChart'; // Keep for later
import { fetchWorkoutDetailsById } from '../lib/api';
import type { SupabasePopulatedWorkout } from '../lib/types';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import styles from './WorkoutPage.module.scss'; // Import styles

const WorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientid');

  const [workoutData, setWorkoutData] = useState<SupabasePopulatedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false); // Keep for later
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);

  useEffect(() => {
    if (!workoutId) {
      setError('Workout ID is missing from URL.');
      setLoading(false);
      return;
    }

    const loadWorkout = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWorkoutDetailsById(workoutId);
        if (data) {
          setWorkoutData(data);
        } else {
          setError('Workout not found.');
        }
      } catch (err) {
        console.error("Error fetching workout details:", err);
        setError(err instanceof Error ? err.message : 'Failed to load workout details');
      }
      setLoading(false);
    };

    loadWorkout();
  }, [workoutId]);

  const handleFinishWorkout = () => {
    console.log("Finish workout clicked for:", workoutData?.id);
    setIsFinishDialogOpen(false);
    // Potentially set showChart(true) here later
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
              <BlockViewer key={block.id} block={block} blockNumber={index + 1} />
            ))
          ) : (
            <p className={styles.statusMessage}>No blocks found for this workout.</p>
          )}
          
          <RadixDialog.Root open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
            <RadixDialog.Trigger asChild>
              {/* Using a styled button class here */}
              <button className={`${styles.dialogButton} ${styles.dialogButtonPrimary}`} style={{margin: '2rem auto', display: 'block'}}>
                Finish Workout
              </button>
            </RadixDialog.Trigger>
            <RadixDialog.Portal>
              <RadixDialog.Overlay className={styles.dialogOverlay} />
              <RadixDialog.Content className={styles.dialogContent}>
                <RadixDialog.Title className={styles.dialogTitle}>Confirm Finish</RadixDialog.Title>
                <RadixDialog.Description className={styles.dialogDescription}>
                  Are you sure you want to mark this workout as complete?
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
                    Yes, Finish
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