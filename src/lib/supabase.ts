import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example usage for workout progress
export const upsertWorkoutProgress = async (progress: {
  workoutId: string;
  clientId: string;
  exerciseId: string;
  blockId: string;
  status: 'completed' | 'incomplete'; // Example status
}) => {
  const { data, error } = await supabase
    .from('workout_progress') // Assuming a table named 'workout_progress'
    .upsert(progress, {
      onConflict: 'workoutId,clientId,exerciseId,blockId', // Define your conflict resolution columns
    })
    .select();

  if (error) {
    console.error('Error upserting workout progress:', error);
    throw error;
  }
  return data;
};

// Add more Supabase interaction functions as needed 