import { createClient } from "@supabase/supabase-js";

// Only use dotenv in Node.js environment
const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
if (isNode) {
	const dotenv = require("dotenv");
	dotenv.config();
}

// --- DEVELOPMENT/LOCAL Environment Configuration ---
// These are typically used when running local dev server or scripts like sync.ts
const localSupabaseUrl = isNode ? process.env.VITE_LOCAL_SUPABASE_URL : import.meta.env.VITE_LOCAL_SUPABASE_URL;
const localSupabaseAnonKey = isNode ? process.env.VITE_LOCAL_SUPABASE_ANON_KEY : import.meta.env.VITE_LOCAL_SUPABASE_ANON_KEY;

// --- PRODUCTION/REMOTE Environment Configuration ---
const remoteSupabaseUrl = isNode ? process.env.VITE_SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL;
const remoteSupabaseAnonKey = isNode ? process.env.VITE_SUPABASE_ANON_KEY : import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- Logic to choose Supabase instance ---
// Simple toggle: Set this to true to use local, false for remote.
// For more sophisticated setups, you might use an environment variable like `USE_LOCAL_SUPABASE`
let USE_LOCAL_SUPABASE_OVERRIDE = true; // <--- TOGGLE THIS FOR LOCAL/REMOTE
USE_LOCAL_SUPABASE_OVERRIDE = false;

let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;

if (USE_LOCAL_SUPABASE_OVERRIDE) {
	console.log("Supabase client configured to use LOCAL instance (via override).");
	supabaseUrl = localSupabaseUrl;
	supabaseAnonKey = localSupabaseAnonKey;
} else {
	console.log("Supabase client configured to use REMOTE instance.");
	supabaseUrl = remoteSupabaseUrl;
	supabaseAnonKey = remoteSupabaseAnonKey;
}

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error(`Supabase URL or Anon Key is missing. Check .env variables.
		 Attempted to load: URL=${supabaseUrl}, Key Present=${!!supabaseAnonKey}`);
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

// Function to add or update a user's video upload list for a specific exercise
export const upsertUserVideoUpload = async (
	clientId: string,
	exerciseId: string,
	newVideoUrl: string,
	starredVideoIndex?: number,
): Promise<any> => {
	// First, try to fetch the existing record for the client and exercise
	const { data: existingRecord, error: fetchError } = await supabase
		.from("user_video_uploads")
		.select("id, vimeo_video_urls, starred_video_index")
		.eq("client_id", clientId)
		.eq("exercise_id", exerciseId)
		.maybeSingle();

	if (fetchError) {
		console.error("Error fetching user video uploads:", fetchError);
		throw fetchError;
	}

	if (existingRecord) {
		// Client has existing record for this exercise, append new URL if not already present
		const currentUrls = existingRecord.vimeo_video_urls || [];
		let updatedUrls = currentUrls;
		if (!currentUrls.includes(newVideoUrl)) {
			updatedUrls = [...currentUrls, newVideoUrl];
		}
		const updateData: any = {
			vimeo_video_urls: updatedUrls,
			updated_at: new Date().toISOString(),
		};
		if (typeof starredVideoIndex === "number") {
			updateData.starred_video_index = starredVideoIndex;
		}
		const { data, error } = await supabase
			.from("user_video_uploads")
			.update(updateData)
			.eq("id", existingRecord.id)
			.select();

		if (error) {
			console.error("Error updating user video uploads:", error);
			throw error;
		}
		return data;
	} else {
		// No existing record for this client and exercise, create a new one
		const insertData: any = {
			client_id: clientId,
			exercise_id: exerciseId,
			vimeo_video_urls: [newVideoUrl],
		};
		if (typeof starredVideoIndex === "number") {
			insertData.starred_video_index = starredVideoIndex;
		}
		const { data, error } = await supabase
			.from("user_video_uploads")
			.insert(insertData)
			.select();

		if (error) {
			console.error("Error inserting new user video upload record:", error);
			throw error;
		}
		return data;
	}
};

// Add more Supabase interaction functions as needed 