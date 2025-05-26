// tbl.js
// This script is for testing your Netlify function: api/airtable-video-processor.ts
// Make sure you have 'netlify dev' running in another terminal.
// You might need to install node-fetch: npm install node-fetch

// For Node.js 18+ you can use global fetch. For older versions, or if you prefer:
import fetch from "node-fetch"; // Or: import fetch from 'node-fetch'; if using ES modules in Node

const netlifyFunctionUrl = "http://localhost:8888/.netlify/functions/airtable-video-processor";

// --- Replace with your test data ---
const testVimeoCode = "1087594567";
const testSupabaseExerciseId = "000fb086-bc39-405d-b79b-b28242f76d09";
// -------------------------------------

async function callAirtableProcessor() {
	console.log(`Calling Netlify function at: ${netlifyFunctionUrl}`);
	console.log(`With vimeo_code: ${testVimeoCode}, supabase_exercise_id: ${testSupabaseExerciseId}`);

	try {
		const response = await fetch(netlifyFunctionUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				vimeo_code: testVimeoCode,
				supabase_exercise_id: testSupabaseExerciseId,
			}),
		});

		const responseBody = await response.json();

		console.log("\n--- Function Response ---");
		console.log("Status:", response.status);
		console.log("Body:", responseBody);
		console.log("-------------------------");

		if (response.ok) {
			console.log("Function call successful!");
		} else {
			console.error("Function call failed.");
		}
	} catch (error) {
		console.error("Error calling Netlify function:", error);
	}
}

callAirtableProcessor();
