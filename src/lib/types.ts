// Define TypeScript types for your Airtable data structure here

// Represents a generic Airtable API response for a list of records
export interface AirtableListResponse<TFields> {
  records: AirtableRecord<TFields>[];
  offset?: string; // For pagination
}

// Represents a single record from Airtable
export interface AirtableRecord<TFields> {
  id: string;
  createdTime: string;
  fields: TFields;
}

// Type for Airtable attachment objects (e.g., images)
export interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string; // e.g., 'image/jpeg'
  thumbnails?: {
    small: { url: string; width: number; height: number };
    large: { url: string; width: number; height: number };
    full?: { url: string; width: number; height: number };
  };
}

// Level 3: Exercise
// Fields specific to the 'Exercises' table (tbl8PKDZMG5nv73Hx)
export interface ExerciseFields {
  "Current Name": string;
  "vimeo video"?: string; // URL
  "Explination 1"?: string;
  "Explination 2"?: string;
  "Explination 3"?: string;
  "Explination 4"?: string;
  "Primary Muscle Worked"?: string[]; // Assuming multi-select or lookup returning array of strings
  "Vimeo Code"?: string; // Embed code or ID
  // Add any other fields from your 'Exercise Library' table
}
export type Exercise = AirtableRecord<ExerciseFields>;

// Level 2: Block
// Fields specific to the 'Blocks Overview' table (tbloYDsl2c56zGndO)
export interface BlockFields {
  "Block Name": string;
  "Public Name"?: string;
  "Exercises"?: string[]; // Array of Exercise Record IDs (from tbl8PKDZMG5nv73Hx)
  "Sets & Reps"?: string;
  "html code for block"?: string;
  "card for preview"?: AirtableAttachment[]; // Array of attachments
  "Equipment"?: string[]; // Assuming multi-select or lookup
  "Rest between Sets"?: string;
  "Intensity"?: string;
  // Add any other fields from your 'Blocks Overview' table
}
export interface PopulatedBlockFields extends Omit<BlockFields, 'Exercises'> {
  resolvedExercises?: Exercise[];
}
export type Block = AirtableRecord<BlockFields>;
export type PopulatedBlock = AirtableRecord<PopulatedBlockFields>;

// For WorkoutCard: a preview of Block 1, containing only essential fields for display
export interface BlockPreviewFields {
  "Public Name"?: string;
  "card for preview"?: AirtableAttachment[];
}

// Level 1: Workout
// Fields specific to the 'Workouts' table (tblqdC3fWyvyFMBxv)
export interface WorkoutFields {
  "Name": string;
  "Type of workout"?: string;
  "1on1 Client Name"?: string;
  "Block 1"?: string[]; // Array of Block Record IDs (from tbloYDsl2c56zGndO)
  "Block 2"?: string[]; // Array of Block Record IDs
  "Block 3"?: string[]; // Array of Block Record IDs
  "Code Block 1"?: string; // Text field
  // Add any other fields from your 'Workouts' table
}

// For the workout list on Home page, we want workout fields + Block 1 preview
export interface WorkoutWithBlock1PreviewFields extends WorkoutFields {
  resolvedBlock1Preview?: BlockPreviewFields;
}
export type WorkoutWithBlock1Preview = AirtableRecord<WorkoutWithBlock1PreviewFields>;

export interface PopulatedWorkoutFields extends Omit<WorkoutFields, 'Block 1' | 'Block 2' | 'Block 3'> {
  resolvedBlock1?: PopulatedBlock;
  resolvedBlock2?: PopulatedBlock;
  resolvedBlock3?: PopulatedBlock;
}

export type Workout = AirtableRecord<WorkoutFields>;
export type PopulatedWorkout = AirtableRecord<PopulatedWorkoutFields>;

// For Supabase persistence
export interface WorkoutProgress {
  id?: number; // Auto-incrementing primary key from Supabase
  user_id?: string; // If you have user authentication
  client_id: string; // From URL query param
  workout_id: string; // Airtable record ID
  block_id: string; // Airtable record ID
  exercise_id: string; // Airtable record ID
  set_number?: number; // If tracking per set
  completed_at?: string; // ISO timestamp
  status: 'incomplete' | 'in_progress' | 'completed' | 'skipped';
}

// If you have a separate table for exercise completion, otherwise WorkoutProgress can handle it.
// export interface ExerciseCompletion extends WorkoutProgress {}

// Helper type for API responses that might be a single record or an error
export type AirtableSingleResponse<TFields> = AirtableRecord<TFields> | { error: any }; 