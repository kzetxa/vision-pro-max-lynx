import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BlockViewer from '../components/BlockViewer';
import CompletionChart from '../components/CompletionChart';
import { getWorkoutDetails } from '../lib/api';
import type { PopulatedWorkout, PopulatedBlock } from '../lib/types';
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

  const [workoutDetails, setWorkoutDetails] = useState<PopulatedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);

  useEffect(() => {
    if (!workoutId) {
      setError('No workout ID provided.');
      setLoading(false);
      return;
    }
    const loadWorkoutDetails = async () => {
      try {
        setLoading(true);
        const data = await getWorkoutDetails(workoutId);
        setWorkoutDetails(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch workout details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkoutDetails();
  }, [workoutId]);

  const confirmFinishWorkout = () => {
    setShowChart(true);
    setIsFinishDialogOpen(false);
    console.log('Workout finished by client:', clientId, 'for workout:', workoutId);
    // TODO: Persist workout completion status to Supabase here
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', fontSize: '1.2em'}}><p>Loading workout details...</p></div>;
  if (error) return <div style={{textAlign: 'center', marginTop: '50px', color: '#ff8a80'}}><p>Error: {error}</p></div>;
  if (!workoutDetails) return <div style={{textAlign: 'center', marginTop: '50px', fontSize: '1.1em'}}><p>Workout not found.</p></div>;

  const { fields } = workoutDetails;
  const blocksToDisplay: PopulatedBlock[] = [];
  if (fields.resolvedBlock1) blocksToDisplay.push(fields.resolvedBlock1);
  if (fields.resolvedBlock2) blocksToDisplay.push(fields.resolvedBlock2);
  if (fields.resolvedBlock3) blocksToDisplay.push(fields.resolvedBlock3);

  return (
    <div className="glassmorphic" style={{ padding: 'clamp(20px, 5vw, 40px)', maxWidth: '900px', margin: '20px auto', width: '90%' }}>
      <h2 style={{textAlign: 'center', marginBottom: '8px'}}>{fields.Name || 'Unnamed Workout'}</h2>
      <p style={{textAlign: 'center', fontSize: '0.9em', color: 'var(--text-secondary)' , marginBottom: '5px'}}>Client ID: {clientId || 'N/A'}</p>
      {fields["Type of workout"] && <p style={{textAlign: 'center', fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '30px'}}>Type: {fields["Type of workout"]}</p>}

      {!showChart ? (
        <>
          <h3 style={{ marginTop: '20px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border-color)', paddingBottom: '12px', color: 'var(--text-headings)'}}>Workout Blocks:</h3>
          {blocksToDisplay.length > 0 ? (
            blocksToDisplay.map((block) => (
              <BlockViewer key={block.id} block={block} />
            ))
          ) : (
            <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '20px 0'}}>No blocks found for this workout.</p>
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
                  Are you sure you want to mark this workout as finished? This action will proceed to the summary.
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
                    onClick={confirmFinishWorkout} 
                    style={{padding: '10px 20px', borderRadius: 'var(--glass-border-radius)', backgroundColor: 'var(--accent-color)', color: 'white', cursor:'pointer', fontWeight: 500, transition: 'background-color 0.2s ease', border: 'none'}}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'var(--accent-color-hover)'}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = 'var(--accent-color)'}
                  >
                    Confirm Finish
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
        <CompletionChart workoutData={workoutDetails} />
      )}
    </div>
  );
};

export default WorkoutPage; 