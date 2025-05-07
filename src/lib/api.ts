// This file will handle fetching data from your backend (Netlify Functions proxying Airtable)

import type {
  AirtableListResponse,
  PopulatedWorkout,
  PopulatedBlock,
  WorkoutWithBlock1Preview,
  WorkoutWithBlock1PreviewFields // Used for casting
  // WorkoutFields, // Unused
  // Workout, // Unused
  // Block // Unused
} from './types';

const API_BASE_URL = '/api'; // Proxied via vite.config.ts to Netlify functions

// Fetch all workouts (initially without populated blocks for the home page)
export const fetchWorkouts = async (): Promise<WorkoutWithBlock1Preview[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getWorkouts`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to fetch workouts:", response.status, errorData);
      throw new Error(`HTTP error ${response.status}: ${errorData}`);
    }
    // The server now returns AirtableListResponse<WorkoutWithBlock1PreviewFields>
    const data: AirtableListResponse<WorkoutWithBlock1PreviewFields> = await response.json();
    return data.records as WorkoutWithBlock1Preview[]; // Cast records to the more specific type
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