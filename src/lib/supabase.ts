import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lpascrtwcrahykjkfqoo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYXNjcnR3Y3JhaHlramtmcW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzQ0NDIsImV4cCI6MjA1OTU1MDQ0Mn0.jyqV34f68CbCaHH5ngmdF_PCFtT1VTEOsRimcXYbbk4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey!);

// Inserts a new record to signify a completed workout with summary stats.
export const saveWorkoutSummary = async (summary: {
	workout_id: string;
	client_id: string;
	total_time_seconds: number;
	total_sets_completed: number;
	total_reps_completed: number;
	total_sets_skipped: number;
}): Promise<any> => {
	const { data, error } = await supabase
		.from("workout_progress") // The table now stores summary rows
		.insert({
			...summary,
			completed_at: new Date().toISOString(), // Mark completion time
		})
		.select();

	if (error) {
		console.error("Error saving workout summary:", error);
		throw error;
	}
	return data;
};

// Fetches the summary for a completed workout.
export const getWorkoutSummary = async (
	workout_id: string,
	client_id: string
): Promise<any | null> => {
	const { data, error } = await supabase
		.from("workout_progress")
		.select("*")
		.eq("workout_id", workout_id)
		.eq("client_id", client_id)
		// Assuming rows with a null exercise_id are summaries
		.is("exercise_id", null)
		.maybeSingle();

	if (error) {
		console.error("Error fetching workout summary:", error);
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

export const getOrGenerateAudio = async (exerciseId: string, text: string): Promise<string | null> => {
	try {
		const res = await fetch("/.netlify/functions/generate-voice", {
			method: "POST",
			body: JSON.stringify({ exerciseId, text }),
			headers: { "Content-Type": "application/json" },
		});

		if (!res.ok) {
			const errorText = await res.text();
			console.error("Error generating voice audio:", res.status, errorText);
			throw new Error(`Failed to generate voice: ${res.status} ${errorText}`);
		}

		const { url } = await res.json();

		return url;
	} catch (err) {
		console.error("An unexpected error occurred in getOrGenerateAudio:", err);
		return null; // Or rethrow, or handle as appropriate
	}
};