import React, { useEffect, useState } from 'react';
import WorkoutCard from '../components/WorkoutCard';
import { fetchWorkouts } from '../lib/api';
import type { Workout } from '../lib/types'; // Back to using Workout type

const Home: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]); // Back to Workout[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        const data = await fetchWorkouts();
        setWorkouts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch workouts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkouts();
  }, []);

  if (loading) return <p>Loading workouts...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Available Workouts</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {workouts.map(workout => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </div>
  );
};

export default Home;
