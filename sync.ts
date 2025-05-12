import Airtable from 'airtable';
// import { Pool } from 'pg'; // Or just Client if you prefer
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path'; // Import path for robust .env loading

// Ensure .env is loaded from the script's execution context or a specified path
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log("Script starting...");
console.log("AIRTABLE_API_KEY:", process.env.AIRTABLE_API_KEY ? 'Loaded' : 'MISSING!');
console.log("AIRTABLE_BASE_ID:", process.env.AIRTABLE_BASE_ID ? 'Loaded' : 'MISSING!');
// console.log("SUPABASE_DB_CONNECTION_STRING:", process.env.SUPABASE_DB_CONNECTION_STRING ? process.env.SUPABASE_DB_CONNECTION_STRING.substring(0,30) + '...' : 'MISSING!'); // Log only part of the string for security
console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? 'Loaded' : 'MISSING!');
console.log("SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? 'Loaded' : 'MISSING!');


// ---- Configuration ----
const airtableApiKey = process.env.AIRTABLE_API_KEY;
const airtableBaseId = process.env.AIRTABLE_BASE_ID;
// const supabaseConnectionString = process.env.SUPABASE_DB_CONNECTION_STRING;
const supabaseUrl = process.env.SUPABASE_URL;
// For scripts like this, a service role key is preferred over an anon key.
// const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseKey = process.env.SUPABASE_ANON_KEY;


if (!airtableApiKey || !airtableBaseId || !supabaseUrl || !supabaseKey) {
	console.error("Missing required environment variables! Check .env file. Required: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, SUPABASE_URL, SUPABASE_ANON_KEY.");
	process.exit(1);
}

const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId!);
// const pool = new Pool({ connectionString: supabaseConnectionString });
const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseKey!);

// ---- Type Definitions (for data mapping) ----
interface AirtableExerciseFields {
	"Current Name"?: string;
	"Vimeo Code"?: string;
	"Public Name (from Equipment)"?: string; // Assuming this is how it comes from Airtable
	"Over Sort Category"?: string;
	"Explination 1"?: string; // Note: Airtable specific spelling
	"Explination 2"?: string;
	"Explanation 3"?: string; // Corrected spelling
	"Explanation 4"?: string; // Corrected spelling
	[key: string]: any; // Index signature to satisfy Airtable's FieldSet constraint
}

interface SupabaseExercise {
	airtable_record_id: string;
	current_name?: string;
	vimeo_code?: string;
	equipment_public_name?: string;
	over_sort_category?: string;
	explanation_1?: string; // Correct spelling for Supabase
	explanation_2?: string;
	explanation_3?: string;
	explanation_4?: string;
}

interface AirtableBlocksOverviewFields {
	"Public Name"?: string;
	"Rest between Sets"?: string;
	"Intensity"?: string;
	[key: string]: any; // Index signature
}

interface SupabaseBlocksOverview {
	airtable_record_id: string;
	public_name?: string;
	rest_between_sets?: string;
	intensity?: string;
}

interface AirtableIndividualBlockFields {
	"sets"?: number;
	"reps"?: number;
	"sets & reps"?: string;
	"unit"?: string;
	"special"?: string;
	"Exercise Name"?: string[];
	"Block name"?: string[]; // Corrected from "Block Name"
	[key: string]: any;
}

interface SupabaseIndividualBlock {
	airtable_record_id: string;
	block_overview_id?: string;
	airtable_block_overview_record_id?: string;
	exercise_id?: string;
	airtable_exercise_record_id?: string;
	sets?: number;
	reps?: number;
	sets_and_reps_text?: string;
	unit?: string;
	special_instructions?: string;
}

interface AirtableWorkoutFields {
	"Preview Video URL"?: string;
	"Header Image URL"?: string;
	"Public Workout Title"?: string;
	"Focus Area"?: string;
	"Level"?: string;
	"Duration"?: string;
	"Block 1"?: string[];
	"Block 2"?: string[];
	"Block 3"?: string[];
	"Block 4"?: string[];
	"Block 5"?: string[];
	[key: string]: any;
}

interface SupabaseWorkout {
	airtable_record_id: string;
	preview_video_url?: string;
	header_image_url?: string;
	public_workout_title?: string;
	focus_area?: string;
	level?: string;
	duration?: string;
	block_1_id?: string;
	airtable_block_1_record_id?: string;
	block_2_id?: string;
	airtable_block_2_record_id?: string;
	block_3_id?: string;
	airtable_block_3_record_id?: string;
	block_4_id?: string;
	airtable_block_4_record_id?: string;
	block_5_id?: string;
	airtable_block_5_record_id?: string;
}

// ---- Helper Functions ----
async function upsertRecords(
	tableName: string,
	records: any[], // Array of objects to insert/update
	conflictColumn: string, // e.g., 'airtable_record_id'
	columns: string[] // All columns in the Supabase table
) {
	if (records.length === 0) {
		console.log(`No records to upsert for table ${tableName}.`);
		return;
	}

	// const client = await pool.connect(); // Not needed with supabase-js
	try {
		// await client.query('BEGIN'); // Supabase upsert handles transactions implicitly for the operation

		// Supabase client's upsert method
		// The `records` should be an array of objects matching Supabase table structure.
		// `conflictColumn` is used in the `onConflict` option.
		const { data, error } = await supabase
			.from(tableName)
			.upsert(records, {
				onConflict: conflictColumn,
				// returning: 'minimal', // Supabase default is 'representation', which returns the upserted records. 'minimal' returns nothing.
			});

		if (error) {
			console.error(`Error upserting into ${tableName}:`, error);
			// await client.query('ROLLBACK'); // Handled by Supabase or not applicable
			throw error; // Re-throw to stop the script or handle higher up
		}

		// await client.query('COMMIT');
		console.log(`Successfully upserted ${records.length} records into ${tableName}.`);
	} catch (error) {
		// If error was not thrown by supabase client already, log it
		// if (!(error instanceof Error && 'message' in error && error.message.includes('PostgrestError'))) {
		//  console.error(`Unhandled error during upsert into ${tableName}:`, error);
		// }
		// Rollback is not explicitly managed here with Supabase client for single upsert operations.
		// The operation either succeeds or fails.
		throw error; // Re-throw
	} finally {
		// client.release(); // Not needed
	}
}

async function buildIdMap(tableName: string, airtableIdColumn: string = 'airtable_record_id', supabaseIdColumn: string = 'id'): Promise<Map<string, string>> {
	console.log(`[buildIdMap] Building ID map for ${tableName}.`);
	const idMap = new Map<string, string>();
	// let client; // Not needed
	try {
		// client = await pool.connect(); // Not needed
		// console.log(`[buildIdMap] Connected to DB for table ${tableName}. Fetching IDs...`); 
		// const res = await client.query(`SELECT ${airtableIdColumn}, ${supabaseIdColumn} FROM public.${tableName}`);

		const { data, error } = await supabase
			.from(tableName)
			.select(`${supabaseIdColumn}, ${airtableIdColumn}`);

		if (error) {
			console.error(`[buildIdMap] Error fetching IDs for ${tableName}:`, error);
			throw error; // Propagate the error
		}

		if (data) {
			data.forEach((row: any) => { // Add :any type for row if Supabase types are not explicitly defined here
				if (row[airtableIdColumn] && row[supabaseIdColumn]) {
					idMap.set(row[airtableIdColumn], row[supabaseIdColumn]);
				}
			});
		}

	} catch (error) {
		// Error already logged or will be logged by the caller if re-thrown
		// console.error(`[buildIdMap] Error building ID map for ${tableName}:`, error);
		// Re-throw if not already a Supabase error, or let it propagate
		if (!(error instanceof Error && 'message' in error && (error.message.includes('PostgrestError') || error.message.includes('Error fetching IDs')))) {
			console.error(`[buildIdMap] Unhandled error building ID map for ${tableName}:`, error);
		}
		throw error; // Ensure errors are propagated
	} finally {
		// if (client) client.release(); // Not needed
	}
	console.log(`[buildIdMap] Finished for ${tableName}. Found ${idMap.size} entries.`);
	return idMap;
}

// ---- Main Sync Functions ----

async function syncExerciseLibrary() {
	console.log("Starting sync for Exercise Library...");
	const airtableRecords: Airtable.Record<AirtableExerciseFields>[] = [];

	try {
		await base('Exercise Library').select({
			// Adjust fields if needed, or fetch all relevant ones
			fields: ["Current Name", "Vimeo Code", "Public Name (from Equipment)", "Over Sort Category", "Explination 1", "Explination 2", "Explanation 3", "Explanation 4"]
		}).eachPage((pageRecords, fetchNextPage) => {
			pageRecords.forEach(record => airtableRecords.push(record as any)); // Cast needed if fields are strictly typed
			fetchNextPage();
		});

		console.log(`Fetched ${airtableRecords.length} records from Airtable Exercise Library.`);
		if (airtableRecords.length === 0) return;

		const supabaseExercises: SupabaseExercise[] = airtableRecords.map(record => ({
			airtable_record_id: record.id,
			current_name: record.fields["Current Name"],
			vimeo_code: record.fields["Vimeo Code"],
			equipment_public_name: record.fields["Public Name (from Equipment)"], // Adapt if it's a linked record ID
			over_sort_category: record.fields["Over Sort Category"],
			explanation_1: record.fields["Explination 1"],
			explanation_2: record.fields["Explination 2"],
			explanation_3: record.fields["Explanation 3"],
			explanation_4: record.fields["Explanation 4"],
		}));

		const columns = [
			'airtable_record_id', 'current_name', 'vimeo_code',
			'equipment_public_name', 'over_sort_category',
			'explanation_1', 'explanation_2', 'explanation_3', 'explanation_4'
		];
		await upsertRecords('exercise_library', supabaseExercises, 'airtable_record_id', columns);

	} catch (error) {
		console.error("Error syncing Exercise Library:", error);
		throw error; // Re-throw to be caught by main
	}
}

async function syncBlocksOverview() {
	console.log("Starting sync for Blocks Overview...");
	const airtableRecords: Airtable.Record<AirtableBlocksOverviewFields>[] = [];

	try {
		await base('Blocks Overview').select({
			fields: ["Public Name", "Rest between Sets", "Intensity"]
		}).eachPage((pageRecords, fetchNextPage) => {
			pageRecords.forEach(record => airtableRecords.push(record as any));
			fetchNextPage();
		});

		console.log(`Fetched ${airtableRecords.length} records from Airtable Blocks Overview.`);
		if (airtableRecords.length === 0) return;

		const supabaseBlocks: SupabaseBlocksOverview[] = airtableRecords.map(record => ({
			airtable_record_id: record.id,
			public_name: record.fields["Public Name"],
			rest_between_sets: record.fields["Rest between Sets"],
			intensity: record.fields["Intensity"],
		}));

		const columns = [
			'airtable_record_id', 'public_name', 'rest_between_sets', 'intensity'
		];
		await upsertRecords('blocks_overview', supabaseBlocks, 'airtable_record_id', columns);

	} catch (error) {
		console.error("Error syncing Blocks Overview:", error);
		throw error; // Re-throw
	}
}

async function syncIndividualBlocks(exerciseIdMap: Map<string, string>, blockOverviewIdMap: Map<string, string>) {
	console.log("Starting sync for Individual Blocks...");

	// ID maps are now passed in, no need to check if both are empty here as main will build them.
	// It's up to the calling function to ensure maps are adequately populated.

	const airtableRecords: Airtable.Record<AirtableIndividualBlockFields>[] = [];

	try {
		await base('individual blocks').select({
			fields: ["sets", "reps", "sets & reps", "unit", "special", "Exercise Name", "Block name"]
		}).eachPage((pageRecords, fetchNextPage) => {
			pageRecords.forEach(record => airtableRecords.push(record as any));
			fetchNextPage();
		});

		console.log(`Fetched ${airtableRecords.length} records from Airtable Individual Blocks.`);
		if (airtableRecords.length === 0) return;

		const supabaseIndividualBlocks: SupabaseIndividualBlock[] = airtableRecords.map(record => {
			const airtableExerciseId = record.fields["Exercise Name"]?.[0];
			const airtableParentBlockOverviewId = record.fields["Block name"]?.[0];

			const supabaseExerciseUUID = airtableExerciseId ? exerciseIdMap.get(airtableExerciseId) : undefined;
			const supabaseBlockOverviewUUID = airtableParentBlockOverviewId ? blockOverviewIdMap.get(airtableParentBlockOverviewId) : undefined;

			if (airtableExerciseId && !supabaseExerciseUUID) {
				console.warn(`[Individual Blocks] Could not find Supabase UUID for Airtable Exercise ID: ${airtableExerciseId} in record ${record.id}`);
			}
			if (airtableParentBlockOverviewId && !supabaseBlockOverviewUUID) {
				console.warn(`[Individual Blocks] Could not find Supabase UUID for Airtable Parent Block Overview ID: ${airtableParentBlockOverviewId} (from field "Block name") in record ${record.id}`);
			}

			return {
				airtable_record_id: record.id,
				block_overview_id: supabaseBlockOverviewUUID,
				airtable_block_overview_record_id: airtableParentBlockOverviewId,
				exercise_id: supabaseExerciseUUID,
				airtable_exercise_record_id: airtableExerciseId,
				sets: record.fields["sets"],
				reps: record.fields["reps"],
				sets_and_reps_text: record.fields["sets & reps"],
				unit: record.fields["unit"],
				special_instructions: record.fields["special"],
			};
		});

		const columns = [
			'airtable_record_id', 'block_overview_id', 'airtable_block_overview_record_id',
			'exercise_id', 'airtable_exercise_record_id', 'sets', 'reps',
			'sets_and_reps_text', 'unit', 'special_instructions'
		];
		await upsertRecords('individual_blocks', supabaseIndividualBlocks, 'airtable_record_id', columns);

	} catch (error) {
		console.error("Error syncing Individual Blocks:", error);
		throw error; // Re-throw
	}
}

async function syncWorkouts(blockOverviewIdMap: Map<string, string>) {
	console.log("Starting sync for Workouts...");

	if (blockOverviewIdMap.size === 0) {
		console.warn("[Workouts] Blocks Overview ID map is empty. Workout block links might not be resolved.");
	}

	const airtableRecords: Airtable.Record<AirtableWorkoutFields>[] = [];

	try {
		await base('Workouts with selection for blocks HTML').select({
			fields: [
				"Preview Video URL", "Header Image URL", "Public Workout Title",
				"Focus Area", "Level", "Duration",
				"Block 1", "Block 2", "Block 3", "Block 4", "Block 5"
			]
		}).eachPage((pageRecords, fetchNextPage) => {
			pageRecords.forEach(record => airtableRecords.push(record as any));
			fetchNextPage();
		});

		console.log(`Fetched ${airtableRecords.length} records from Airtable Workouts.`);
		if (airtableRecords.length === 0) return;

		const supabaseWorkouts: SupabaseWorkout[] = airtableRecords.map(record => {
			const getSupabaseBlockId = (blockField: string[] | undefined) => {
				const airtableBlockId = blockField?.[0];
				const supabaseUUID = airtableBlockId ? blockOverviewIdMap.get(airtableBlockId) : undefined;
				if (airtableBlockId && !supabaseUUID) {
					console.warn(`[Workouts] Could not find Supabase UUID for Airtable Block ID: ${airtableBlockId} in workout record ${record.id}`);
				}
				return supabaseUUID;
			};

			return {
				airtable_record_id: record.id,
				preview_video_url: record.fields["Preview Video URL"],
				header_image_url: record.fields["Header Image URL"],
				public_workout_title: record.fields["Public Workout Title"],
				focus_area: record.fields["Focus Area"],
				level: record.fields["Level"],
				duration: record.fields["Duration"],
				block_1_id: getSupabaseBlockId(record.fields["Block 1"]),
				airtable_block_1_record_id: record.fields["Block 1"]?.[0],
				block_2_id: getSupabaseBlockId(record.fields["Block 2"]),
				airtable_block_2_record_id: record.fields["Block 2"]?.[0],
				block_3_id: getSupabaseBlockId(record.fields["Block 3"]),
				airtable_block_3_record_id: record.fields["Block 3"]?.[0],
				block_4_id: getSupabaseBlockId(record.fields["Block 4"]),
				airtable_block_4_record_id: record.fields["Block 4"]?.[0],
				block_5_id: getSupabaseBlockId(record.fields["Block 5"]),
				airtable_block_5_record_id: record.fields["Block 5"]?.[0],
			};
		});

		const columns = [
			'airtable_record_id', 'preview_video_url', 'header_image_url', 'public_workout_title',
			'focus_area', 'level', 'duration',
			'block_1_id', 'airtable_block_1_record_id',
			'block_2_id', 'airtable_block_2_record_id',
			'block_3_id', 'airtable_block_3_record_id',
			'block_4_id', 'airtable_block_4_record_id',
			'block_5_id', 'airtable_block_5_record_id'
		];
		await upsertRecords('workouts', supabaseWorkouts, 'airtable_record_id', columns);

	} catch (error) {
		console.error("Error syncing Workouts:", error);
		throw error; // Re-throw
	}
}

async function main() {
	try {
		// Build ID maps once where possible
		const exerciseIdMap = await buildIdMap('exercise_library');
		const blockOverviewIdMap = await buildIdMap('blocks_overview');

		// Sync in order of dependency
		await syncExerciseLibrary();
		await syncBlocksOverview();
		await syncIndividualBlocks(exerciseIdMap, blockOverviewIdMap);
		await syncWorkouts(blockOverviewIdMap);

		console.log("Sync process completed successfully.");
	} catch (error) {
		console.error("Main sync process failed overall:");
        if (error instanceof Error) {
            console.error("Error Name:", error.name);
            console.error("Error Message:", error.message);
            console.error("Error Stack:", error.stack);
        } else {
            console.error("Raw Error:", error);
        }
	} finally {
		// await pool.end(); // Close the connection pool // Not needed for supabase-js client
	}
}

main();