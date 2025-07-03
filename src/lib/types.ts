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
  "Primary Muscle Worked"?: string | string[]; // Example: Allowing string or array based on previous fix
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
export interface PopulatedBlockFields extends Omit<BlockFields, "Exercises"> {
  resolvedExercises?: Exercise[];
}
export type Block = AirtableRecord<BlockFields>;
export type PopulatedBlock = AirtableRecord<PopulatedBlockFields>;

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
  "card for preview with block (from Block 1)"?: string[]; // Changed to string[]
  // Add any other fields from your 'Workouts' table
}

export interface PopulatedWorkoutFields extends Omit<WorkoutFields, "Block 1" | "Block 2" | "Block 3" | "card for preview with block (from Block 1)"> {
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
  status: "incomplete" | "in_progress" | "completed" | "skipped";
}

// If you have a separate table for exercise completion, otherwise WorkoutProgress can handle it.
// export interface ExerciseCompletion extends WorkoutProgress {}

// Helper type for API responses that might be a single record or an error
export type AirtableSingleResponse<TFields> = AirtableRecord<TFields> | { error: any };

// --- Supabase Types ---

// Base types mirroring Supabase tables (based on sync.ts)
export interface SupabaseExercise {
  id: string; // Primary UUID key from Supabase
  airtable_record_id: string;
  current_name?: string | null;
  vimeo_code?: string | null;
  equipment_public_name?: string | null;
  over_sort_category?: string | null;
  explanation_1?: string | null;
  explanation_2?: string | null;
  explanation_3?: string | null;
  explanation_4?: string | null;
  thumbnail?: string | null;
  // Add other relevant fields from your Supabase exercise_library table
  created_at?: string; 
}

export interface SupabaseBlockOverview {
  id: string; // Primary UUID key from Supabase
  airtable_record_id: string;
  public_name?: string | null;
  rest_between_sets?: string | null;
  intensity?: string | null;
   // Add other relevant fields from your Supabase blocks_overview table
  created_at?: string; 
}

export interface SupabaseIndividualBlock {
  id: string; // Primary UUID key from Supabase
  airtable_record_id: string;
  block_overview_id?: string | null; // Foreign key to blocks_overview.id
  airtable_block_overview_record_id?: string | null;
  exercise_id?: string | null;       // Foreign key to exercise_library.id
  airtable_exercise_record_id?: string | null;
  sets?: number | null;
  reps?: number | null;
  sets_and_reps_text?: string | null;
  unit?: string | null;
  special_instructions?: string | null;
   // Add other relevant fields from your Supabase individual_blocks table
  created_at?: string; 
}

export interface SupabaseWorkout {
  id: string; // Primary UUID key from Supabase
  airtable_record_id: string;
  preview_video_url?: string | null;
  header_image_url?: string | null;
  public_workout_title?: string | null;
  focus_area?: string | null;
  level?: string | null;
  duration?: string | null;
  block_1_id?: string | null; // Foreign key to blocks_overview.id
  airtable_block_1_record_id?: string | null;
  block_2_id?: string | null; // Foreign key to blocks_overview.id
  airtable_block_2_record_id?: string | null;
  block_3_id?: string | null; // Foreign key to blocks_overview.id
  airtable_block_3_record_id?: string | null;
  block_4_id?: string | null; // Foreign key to blocks_overview.id
  airtable_block_4_record_id?: string | null;
  block_5_id?: string | null; // Foreign key to blocks_overview.id
  airtable_block_5_record_id?: string | null;
   // Add other relevant fields from your Supabase workouts table
  created_at?: string; 
}

// --- Structured Types for Frontend Use ---

// Represents an exercise within a block, fetched from Supabase
export type SupabaseBlockExercise = Pick<SupabaseIndividualBlock, "id" | "sets" | "reps" | "sets_and_reps_text" | "unit" | "special_instructions"> & {
  exercise: SupabaseExercise | null; // The joined exercise details
};

// Represents a block with its exercises, fetched from Supabase
export type SupabasePopulatedBlock = SupabaseBlockOverview & {
  block_exercises: SupabaseBlockExercise[]; // Array of exercises in this block
};

// Represents a workout with its blocks populated, fetched from Supabase
// Note: We store blocks in an array now, not fixed fields like block_1, block_2
export type SupabasePopulatedWorkout = Omit<SupabaseWorkout, "block_1_id" | "block_2_id" | "block_3_id" | "block_4_id" | "block_5_id" | "airtable_block_1_record_id" | "airtable_block_2_record_id" | "airtable_block_3_record_id" | "airtable_block_4_record_id" | "airtable_block_5_record_id"> & {
  blocks: SupabasePopulatedBlock[]; // Array of populated blocks for the workout
};

// Represents the data needed for the workout card on the home page
export type SupabaseWorkoutPreview = Pick<SupabaseWorkout, "id" | "public_workout_title" | "header_image_url" | "focus_area" | "level" | "duration"> & {
   block1_public_name?: string | null; // Include block 1's public name if needed for display like before
   // Add other preview fields if necessary, e.g., image derived differently
};

export interface WorkoutSummary {
	workout_id: string;
	client_id: string;
	total_time_seconds: number;
	total_sets_completed: number;
	total_reps_completed: number;
	total_sets_skipped: number;
	completed_at?: string;
} 