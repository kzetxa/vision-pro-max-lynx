// This file will handle fetching data from your backend (Netlify Functions proxying Airtable)

import { supabase } from './supabase'; // Import the initialized Supabase client
import type {
  AirtableListResponse,
  WorkoutFields,
  Workout,
  PopulatedWorkout,
  PopulatedBlock,
  SupabaseWorkout,
  SupabaseBlockOverview,
  SupabaseIndividualBlock,
  SupabaseExercise,
  SupabasePopulatedWorkout,
  SupabasePopulatedBlock,
  SupabaseBlockExercise,
  SupabaseWorkoutPreview
} from './types';

const API_BASE_URL = '/api'; // Proxied via vite.config.ts to Netlify functions

// Fetch all workouts (initially without populated blocks for the home page)
export const fetchWorkouts = async (): Promise<Workout[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getWorkouts`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to fetch workouts:", response.status, errorData);
      throw new Error(`HTTP error ${response.status}: ${errorData}`);
    }
    // Expecting AirtableListResponse<WorkoutFields>
    const data: AirtableListResponse<WorkoutFields> = await response.json();
    return data.records; // Returns Workout[] (which is AirtableRecord<WorkoutFields>[])
  } catch (error) {
    console.error("Error in fetchWorkouts:", error);
    throw error;
  }
};

// Fetch a single workout by its ID, fully populated with blocks and exercises
export const getWorkoutDetails = async (workoutId: string): Promise<PopulatedWorkout> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getWorkoutById?id=${workoutId}`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Failed to fetch workout details for ${workoutId}:`, response.status, errorData);
      throw new Error(`HTTP error ${response.status}: ${errorData}`);
    }
    const data: PopulatedWorkout = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in getWorkoutDetails for ${workoutId}:`, error);
    throw error;
  }
};

// Fetch a single block by its ID, fully populated with exercises
// This might be useful if you ever need to load a block independently
export const getBlockDetails = async (blockId: string): Promise<PopulatedBlock> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getBlockById?id=${blockId}`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Failed to fetch block details for ${blockId}:`, response.status, errorData);
      throw new Error(`HTTP error ${response.status}: ${errorData}`);
    }
    const data: PopulatedBlock = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in getBlockDetails for ${blockId}:`, error);
    throw error;
  }
};

// --- Supabase API Functions ---

const DEFAULT_PAGE_LIMIT = 10;

/**
 * Fetches workouts suitable for display on the home page, with pagination.
 * Includes basic workout details and the public name of the first block.
 * 
 * @param page The page number to fetch (1-indexed).
 * @param limit The number of items per page.
 * @returns An object containing the list of workouts for the page and a boolean indicating if more pages might exist.
 */
export async function fetchWorkoutsForHome(
    page: number = 1, 
    limit: number = DEFAULT_PAGE_LIMIT
): Promise<{ workouts: SupabaseWorkoutPreview[], hasMore: boolean }> {
  console.log(`Fetching workouts page ${page} (limit ${limit}) for home page from Supabase...`);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit - 1;

  const { data: workoutsData, error, count } = await supabase
    .from('workouts')
    .select(`
      id,
      public_workout_title,
      header_image_url,
      focus_area,
      level,
      duration,
      block1:blocks_overview!block_1_id ( public_name ) 
    `, { count: 'exact' }) // Request total count for pagination logic
    // Add filtering if needed, e.g., for published workouts
    // .eq('status', 'published') 
    .order('created_at', { ascending: false })
    .range(startIndex, endIndex); // Apply range for pagination

  if (error) {
    console.error(`Error fetching workouts page ${page}:`, error);
    throw new Error(`Failed to fetch workouts: ${error.message}`);
  }

  const workouts = workoutsData || [];

  // Process data to match the SupabaseWorkoutPreview structure
  const previews: SupabaseWorkoutPreview[] = workouts.map((w: any) => ({
    id: w.id,
    public_workout_title: w.public_workout_title,
    header_image_url: w.header_image_url,
    focus_area: w.focus_area,
    level: w.level,
    duration: w.duration,
    block1_public_name: w.block1?.public_name ?? null,
  }));

  // Determine if there are more workouts to load
  // Compare total fetched so far (page * limit) with the total count from Supabase
  // Or simply check if the number of returned items is less than the limit (might be slightly less accurate on the very last page)
  const hasMore = count ? (page * limit < count) : (previews.length === limit);

  console.log(`Fetched ${previews.length} workout previews for page ${page}. Total count: ${count ?? 'N/A'}. Has more: ${hasMore}`);
  
  return { workouts: previews, hasMore };
}

/**
 * Fetches detailed information for a single workout, including its blocks and exercises.
 * @param workoutId The UUID of the workout to fetch.
 */
export async function fetchWorkoutDetailsById(workoutId: string): Promise<SupabasePopulatedWorkout | null> {
    console.log(`Fetching details for workout ${workoutId} from Supabase...`);

    // 1. Fetch the main workout data
    const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*') // Select all workout fields
        .eq('id', workoutId)
        .single(); // Expecting only one result

    if (workoutError) {
        console.error(`Error fetching workout ${workoutId}:`, workoutError);
        // Throw error or return null depending on desired handling
        if (workoutError.code === 'PGRST116') { // Code for 'No rows found'
             return null;
        }
        throw new Error(`Failed to fetch workout: ${workoutError.message}`);
    }

    if (!workoutData) {
        return null;
    }

    // 2. Get the list of Block Overview IDs for this workout
    const blockOverviewIds = [
        workoutData.block_1_id,
        workoutData.block_2_id,
        workoutData.block_3_id,
        workoutData.block_4_id,
        workoutData.block_5_id,
    ].filter((id): id is string => id !== null && id !== undefined); // Filter out null/undefined IDs

    if (blockOverviewIds.length === 0) {
        console.log(`Workout ${workoutId} has no linked blocks.`);
        // Return workout data with empty blocks array
         const { block_1_id, block_2_id, block_3_id, block_4_id, block_5_id, ...rest } = workoutData;
        return { ...rest, blocks: [] };
    }

    // 3. Fetch the Block Overview details for these IDs
    const { data: blockOverviews, error: blockOverviewError } = await supabase
        .from('blocks_overview')
        .select('*')
        .in('id', blockOverviewIds);

    if (blockOverviewError) {
        console.error(`Error fetching block overviews for workout ${workoutId}:`, blockOverviewError);
        throw new Error(`Failed to fetch block overviews: ${blockOverviewError.message}`);
    }
    if (!blockOverviews) {
         console.warn(`No block overviews found for IDs: ${blockOverviewIds.join(', ')}`);
         const { block_1_id, block_2_id, block_3_id, block_4_id, block_5_id, ...rest } = workoutData;
         return { ...rest, blocks: [] };
    }

    // 4. Fetch all individual blocks (exercises) linked to these Block Overviews, joining with exercise details
    const { data: individualBlocksData, error: individualBlockError } = await supabase
        .from('individual_blocks')
        .select(`
            id,
            sets,
            reps,
            sets_and_reps_text,
            unit,
            special_instructions,
            block_overview_id,
            exercise:exercise_library (*)
        `)
        .in('block_overview_id', blockOverviewIds);

    if (individualBlockError) {
        console.error(`Error fetching individual blocks for workout ${workoutId}:`, individualBlockError);
        throw new Error(`Failed to fetch individual blocks: ${individualBlockError.message}`);
    }

    // 5. Assemble the final Populated Workout structure
    const populatedBlocks: SupabasePopulatedBlock[] = blockOverviews.map(overview => {
        // Filter individual blocks belonging to this overview
        const exercisesForThisBlock: SupabaseBlockExercise[] = (individualBlocksData || [])
            .filter(ib => ib.block_overview_id === overview.id)
            .map((ib: any) => ({ // Cast to any temporarily if types mismatch during build
                id: ib.id,
                sets: ib.sets,
                reps: ib.reps,
                sets_and_reps_text: ib.sets_and_reps_text,
                unit: ib.unit,
                special_instructions: ib.special_instructions,
                exercise: ib.exercise as SupabaseExercise | null // Cast the joined exercise data
            }));
            
        return {
            ...overview,
            block_exercises: exercisesForThisBlock,
        };
    });

    // Order the populatedBlocks based on the original block_N_id sequence if needed
    const orderedPopulatedBlocks = blockOverviewIds.map(id => 
        populatedBlocks.find(pb => pb.id === id)
    ).filter((block): block is SupabasePopulatedBlock => block !== undefined);

    // Omit the original block_N_id fields from the final workout object
    const { 
        block_1_id, airtable_block_1_record_id,
        block_2_id, airtable_block_2_record_id,
        block_3_id, airtable_block_3_record_id,
        block_4_id, airtable_block_4_record_id,
        block_5_id, airtable_block_5_record_id,
         ...restOfWorkoutData 
    } = workoutData;

    const result: SupabasePopulatedWorkout = {
        ...restOfWorkoutData,
        blocks: orderedPopulatedBlocks,
    };

    console.log(`Successfully fetched and assembled details for workout ${workoutId}.`);
    return result;
}

// Add more API functions as needed for blocks, exercises etc. 