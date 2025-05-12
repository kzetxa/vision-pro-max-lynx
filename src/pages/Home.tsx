import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { fetchWorkouts } from '../lib/api'; // Old API call
import { fetchWorkoutsForHome } from '../lib/api'; // New Supabase API call
// import type { WorkoutWithBlock1Preview } from '../lib/types'; // Old type
import type { SupabaseWorkoutPreview } from '../lib/types'; // New Supabase type
import WorkoutCard from '../components/WorkoutCard';

const Home: React.FC = () => {
  // const [workouts, setWorkouts] = useState<WorkoutWithBlock1Preview[]>([]); // Old state type
  const [workouts, setWorkouts] = useState<SupabaseWorkoutPreview[]>([]); // New state type
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkouts = async () => {
      setLoading(true);
      setError(null);
      try {
        // const data = await fetchWorkouts(); // Old API call
        const data = await fetchWorkoutsForHome(); // New API call
        setWorkouts(data);
      } catch (err) {
        console.error("Error fetching workouts:", err);
        setError(err instanceof Error ? err.message : 'Failed to load workouts');
      }
      setLoading(false);
    };

    loadWorkouts();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-headings)'}}>Available Workouts</h1>
      {loading && <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Loading workouts...</p>}
      {error && <p style={{textAlign: 'center', color: 'var(--accent-color)'}}>Error: {error}</p>}
      {!loading && !error && workouts.length === 0 && (
        <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No workouts found.</p>
      )}
      {!loading && !error && workouts.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {workouts.map(workout => (
            // Key should be the Supabase UUID now
            <WorkoutCard key={workout.id} workoutPreview={workout} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
