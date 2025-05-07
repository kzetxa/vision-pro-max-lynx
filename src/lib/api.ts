// This file will handle fetching data from your backend (Netlify Functions proxying Airtable)

import type {
  AirtableListResponse,
  WorkoutFields,
  Workout,
  PopulatedWorkout,
  PopulatedBlock
  // Removed WorkoutWithBlock1Preview types
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

// Add more API functions as needed for blocks, exercises etc. 