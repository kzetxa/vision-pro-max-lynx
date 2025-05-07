import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BlockViewer from '../components/BlockViewer';
import CompletionChart from '../components/CompletionChart';
import { getWorkoutDetails } from '../lib/api';
import type { PopulatedWorkout, PopulatedBlock } from '../lib/types';
// import * as Button from '@radix-ui/react-button'; // Example for Radix Button

const WorkoutPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('clientid');

  const [workoutDetails, setWorkoutDetails] = useState<PopulatedWorkout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);

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

  const handleFinishWorkout = () => {
    setShowChart(true);
    // TODO: Persist workout completion status to Supabase here using clientId and workoutId
    console.log('Workout finished by client:', clientId, 'for workout:', workoutId);
  };

  if (loading) return <p>Loading workout details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!workoutDetails) return <p>Workout not found or no details available.</p>;

  const { fields } = workoutDetails;
  const blocksToDisplay: PopulatedBlock[] = [];
  if (fields.resolvedBlock1) blocksToDisplay.push(fields.resolvedBlock1);
  if (fields.resolvedBlock2) blocksToDisplay.push(fields.resolvedBlock2);
  if (fields.resolvedBlock3) blocksToDisplay.push(fields.resolvedBlock3);

  return (
    <div className="glassmorphic" style={{ padding: '20px', maxWidth: '800px', margin: 'auto', width: '90%' }}>
      <h2>{fields.Name || 'Unnamed Workout'}</h2>
      <p>Client ID: {clientId || 'N/A'}</p>
      {fields["Type of workout"] && <p>Type: {fields["Type of workout"]}</p>}

      {!showChart ? (
        <>
          <h3 style={{ marginTop: '30px' }}>Blocks:</h3>
          {blocksToDisplay.length > 0 ? (
            blocksToDisplay.map((block) => (
              <BlockViewer key={block.id} block={block} />
            ))
          ) : (
            <p>No blocks found for this workout.</p>
          )}
          
          <button 
            onClick={handleFinishWorkout} 
            style={{ marginTop: '30px', padding: '10px 20px', fontSize: '1.1em', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Finish Workout
          </button>
        </>
      ) : (
        <CompletionChart /* workoutData={workoutDetails} */ />
      )}
    </div>
  );
};

export default WorkoutPage; 