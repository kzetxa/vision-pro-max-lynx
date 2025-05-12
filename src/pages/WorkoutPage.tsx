import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BlockViewer from '../components/BlockViewer';
import CompletionChart from '../components/CompletionChart';
import { fetchWorkoutDetailsById } from '../lib/api';
import type { SupabasePopulatedWorkout } from '../lib/types';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

const overlayStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  position: 'fixed',
  inset: 0,
  animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  zIndex: 10,
};

const contentStyle: React.CSSProperties = {
  backgroundColor: 'var(--card-bg-darker, #2c303a)',
  borderRadius: 'var(--glass-border-radius, 12px)',
  boxShadow: 'hsl(206 22% 7% / 40%) 0px 10px 38px -10px, hsl(206 22% 7% / 25%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '480px',
  maxHeight: '85vh',
  padding: '30px',
  animation: 'contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)',
  color: 'var(--text-primary, #e1e1e6)',
  border: '1px solid var(--glass-border-color, rgba(255,255,255,0.18))',
  zIndex: 11,
};

const WorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientid');

  const [workoutData, setWorkoutData] = useState<SupabasePopulatedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
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
  };

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading workout...</p>;
  }

  if (error) {
    return <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-color)' }}>Error: {error}</p>;
  }

  if (!workoutData) {
    return <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Workout data could not be loaded.</p>;
  }

  const workoutTitle = workoutData.public_workout_title || 'Workout Plan';

  return (
    <div className="glassmorphic" style={{ padding: 'clamp(20px, 5vw, 40px)', maxWidth: '900px', margin: '20px auto', width: '90%' }}>
      <h2 style={{textAlign: 'center', marginBottom: '8px'}}>{workoutTitle}</h2>
      <p style={{textAlign: 'center', fontSize: '0.9em', color: 'var(--text-secondary)' , marginBottom: '5px'}}>Client ID: {clientId || 'N/A'}</p>
      {/* Removed Type of Workout display as it's not directly in SupabaseWorkout type */}
      {/* {workoutData["Type of workout"] && <p style={{textAlign: 'center', fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '30px'}}>Type: {workoutData["Type of workout"]}</p>} */}

      {!showChart ? (
        <>
          <h3 style={{ marginTop: '20px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border-color)', paddingBottom: '12px', color: 'var(--text-headings)'}}>Workout Blocks:</h3>
          {workoutData.blocks && workoutData.blocks.length > 0 ? (
            workoutData.blocks.map((block, index) => (
              <BlockViewer key={block.id} block={block} blockNumber={index + 1} />
            ))
          ) : (
            <p>No blocks found for this workout.</p>
          )}
          
          <RadixDialog.Root open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
            <RadixDialog.Trigger asChild>
              <button 
                style={{ 
                  display: 'block',
                  width: 'auto',
                  minWidth: '200px',
                  margin: '40px auto 20px auto',
                  padding: '12px 30px', 
                  fontSize: '1.1em', 
                  cursor: 'pointer', 
                  backgroundColor: '#28a745',
                  color: 'white', 
                  border: 'none', 
                  borderRadius: 'var(--glass-border-radius)',
                  fontWeight: 500,
                  boxShadow: '0 3px 10px rgba(40,167,69,0.3)',
                  transition: 'background-color 0.2s ease, transform 0.1s ease'
                }}
                onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = 'scale(1)'}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#218838')}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#28a745')}
              >
                Finish Workout
              </button>
            </RadixDialog.Trigger>
            <RadixDialog.Portal>
              <RadixDialog.Overlay style={overlayStyle} />
              <RadixDialog.Content style={contentStyle}>
                <RadixDialog.Title style={{ margin: '0 0 15px 0', fontWeight: 600, fontSize: '1.3em', color: 'var(--text-headings)' }}>Confirm Finish</RadixDialog.Title>
                <RadixDialog.Description style={{ marginBottom: '25px', color: 'var(--text-primary)', fontSize: '1em', lineHeight: 1.6 }}>
                  Are you sure you want to mark this workout as complete?
                </RadixDialog.Description>
                <div style={{ display: 'flex', marginTop: '30px', justifyContent: 'flex-end', gap: '15px' }}>
                  <RadixDialog.Close asChild>
                    <button 
                        style={{padding: '10px 20px', borderRadius: 'var(--glass-border-radius)', backgroundColor: 'rgba(255,255,255,0.15)', color: 'var(--text-primary)', cursor:'pointer', fontWeight: 500, transition: 'background-color 0.2s ease', border: 'none'}}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                    >
                        Cancel
                    </button>
                  </RadixDialog.Close>
                  <button 
                    onClick={handleFinishWorkout} 
                    style={{padding: '10px 20px', borderRadius: 'var(--glass-border-radius)', backgroundColor: 'var(--accent-color)', color: 'white', cursor:'pointer', fontWeight: 500, transition: 'background-color 0.2s ease', border: 'none'}}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'var(--accent-color-hover)'}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
                  >
                    Yes, Finish
                  </button>
                </div>
                <RadixDialog.Close asChild>
                  <button 
                    style={{all: 'unset', fontFamily: 'inherit', borderRadius: '100%', height: '30px', width: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', transition: 'background-color 0.2s ease'}}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'transparent'}
                    aria-label="Close"
                  >
                    <Cross2Icon width={20} height={20}/>
                  </button>
                </RadixDialog.Close>
              </RadixDialog.Content>
            </RadixDialog.Portal>
          </RadixDialog.Root>
        </>
      ) : (
        <p>Chart will be shown here.</p>
      )}
    </div>
  );
};

export default WorkoutPage; 