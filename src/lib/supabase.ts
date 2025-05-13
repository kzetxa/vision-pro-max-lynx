import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

const supabaseUrl = "https://lpascrtwcrahykjkfqoo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXNjcnR3Y3JhaHlramtmcW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzQ0NDIsImV4cCI6MjA1OTU1MDQ0Mn0.jyqV34f68CbCaHH5ngmdF_PCFtT1VTEOsRimcXYbbk4";

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error("Supabase URL or Anon Key is missing. Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example usage for workout progress
export const upsertWorkoutProgress = async (progress: {
  workoutId: string;
  clientId: string;
  exerciseId: string;
  blockId: string;
  status: "completed" | "incomplete"; // Example status
}): Promise<any> => {
	const { data, error } = await supabase
		.from("workout_progress") // Assuming a table named 'workout_progress'
		.upsert(progress, {
			onConflict: "workoutId,clientId,exerciseId,blockId", // Define your conflict resolution columns
		})
		.select();

	if (error) {
		console.error("Error upserting workout progress:", error);
		throw error;
	}
	return data;
};

// Add more Supabase interaction functions as needed 