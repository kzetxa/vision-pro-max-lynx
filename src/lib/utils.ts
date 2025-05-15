/**
 * Attempts to extract the first URL from a string that might be
 * a JSON array containing a single URL string (e.g., '["http://example.com"]' ).
 * 
 * @param urlString The potential URL string or stringified array.
 * @returns The extracted URL string, or null if extraction fails or input is invalid.
 */
export function extractUrlFromStringArray(urlString: string | null | undefined): string | null {
	if (!urlString || typeof urlString !== "string") {
		return null;
	}

	const trimmed = urlString.trim();

	// Basic check if it looks like a stringified array
	if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
		try {
			const parsed = JSON.parse(trimmed);
			// Check if it parsed to an array and the first item is a string
			if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
				return parsed[0];
			}
		} catch (e) {
			// Ignore JSON parsing errors, it might just be a string with brackets
			console.warn("Failed to parse potential JSON array string:", urlString, e);
		}
	}
  
	// If it doesn't look like an array or parsing failed, 
	// return null assuming it wasn't the expected format.
	// Alternatively, you could return the original `trimmed` string if 
	// sometimes the URL is stored correctly *without* brackets/quotes.
	// Returning null is safer if you expect ONLY the array format or null.
	return null; 
}

/**
 * Parses sets and reps from Supabase block exercise data.
 * Priority: numeric `sets`/`reps` -> parsing `sets_and_reps_text` -> default (2x2).
 * 
 * @param blockExercise The exercise data object.
 * @returns An object { sets: number, reps: number }.
 */
export function parseSetsAndReps(blockExercise: {
  sets?: number | null;
  reps?: number | null;
  sets_and_reps_text?: string | null;
}): { sets: number; reps: number } {
	const defaultSets = 2;
	const defaultReps = 2;

	// 1. Check explicit numeric columns
	if (
		blockExercise.sets !== null &&
    blockExercise.sets !== undefined &&
    blockExercise.reps !== null &&
    blockExercise.reps !== undefined &&
    Number.isInteger(blockExercise.sets) &&
    Number.isInteger(blockExercise.reps) &&
    blockExercise.sets > 0 &&
    blockExercise.reps > 0
	) {
		return { sets: blockExercise.sets, reps: blockExercise.reps };
	}

	// 2. Try parsing sets_and_reps_text
	if (blockExercise.sets_and_reps_text) {
		const text = blockExercise.sets_and_reps_text.toLowerCase();
		// Simple regex to find patterns like "2x8", "3 x 10", "1x5 each side"
		const match = text.match(/(\d+)\s*x\s*(\d+)/);
		if (match && match[1] && match[2]) {
			const parsedSets = parseInt(match[1], 10);
			const parsedReps = parseInt(match[2], 10);
			if (!isNaN(parsedSets) && !isNaN(parsedReps) && parsedSets > 0 && parsedReps > 0) {
				return { sets: parsedSets, reps: parsedReps };
			}
		}
	}

	// 3. Fallback to default
	return { sets: defaultSets, reps: defaultReps };
}

/**
 * Helper to parse potentially stringified arrays (e.g., from Supabase text fields storing array-like strings).
 * If the string looks like a JSON array, it tries to parse it and join elements with ", ".
 * Otherwise, returns the original string or an empty string if input is null/undefined.
 * @param data The string data to parse.
 * @returns A displayable string.
 */
export function getDisplayableArrayString(data: string | null | undefined): string {
	if (!data) return "";
	try {
		// Check if it looks like a stringified array (basic check)
		if (data.startsWith("[") && data.endsWith("]")) {
			const parsed = JSON.parse(data);
			return Array.isArray(parsed) ? parsed.join(", ") : data;
		}
	} catch (e) {
		// If parsing fails, return the original string
		console.error("Failed to parse array string:", data, e);
		return data;
	}
	// Return original data if not detected as stringified array
	return data;
} 