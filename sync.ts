import Airtable from 'airtable';
// import { Pool } from 'pg'; // Or just Client if you prefer
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path'; // Import path for robust .env loading

// Ensure .env is loaded from the script's execution context or a specified path
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log("Script starting...");

// ---- Argument Parsing for --local flag ----
const args = process.argv.slice(2); // Skip node executable and script path
const useLocalSupabase = args.includes('--local');

if (useLocalSupabase) {
	console.log("Using LOCAL Supabase instance.");
} else {
	console.log("Using REMOTE Supabase instance (default).");
}

// ---- Configuration ----
const airtableApiKey = process.env.VITE_AIRTABLE_API_KEY;
const airtableBaseId = process.env.VITE_AIRTABLE_BASE_ID;
// const supabaseConnectionString = process.env.VITE_SUPABASE_DB_CONNECTION_STRING;

// Conditionally set Supabase credentials
let supabaseUrl: string | undefined;
let supabaseKey: string | undefined;

if (useLocalSupabase) {
	supabaseUrl = process.env.VITE_LOCAL_SUPABASE_URL;
	supabaseKey = process.env.VITE_LOCAL_SUPABASE_ANON_KEY;
	console.log("VITE_LOCAL_SUPABASE_URL:", supabaseUrl ? 'Loaded' : 'MISSING!');
	console.log("VITE_LOCAL_SUPABASE_ANON_KEY:", supabaseKey ? 'Loaded' : 'MISSING!');
} else {
	supabaseUrl = process.env.VITE_SUPABASE_URL;
	supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
	console.log("VITE_SUPABASE_URL:", supabaseUrl ? 'Loaded' : 'MISSING!');
	console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? 'Loaded' : 'MISSING!');
}

console.log("VITE_AIRTABLE_API_KEY:", airtableApiKey ? 'Loaded' : 'MISSING!');
console.log("VITE_AIRTABLE_BASE_ID:", airtableBaseId ? 'Loaded' : 'MISSING!');
// console.log("VITE_SUPABASE_DB_CONNECTION_STRING:", process.env.VITE_SUPABASE_DB_CONNECTION_STRING ? process.env.VITE_SUPABASE_DB_CONNECTION_STRING.substring(0,30) + '...' : 'MISSING!'); // Log only part of the string for security

if (!airtableApiKey || !airtableBaseId || !supabaseUrl || !supabaseKey) {
	let errorMessage = "Missing required environment variables! Check .env file. Required: VITE_AIRTABLE_API_KEY, VITE_AIRTABLE_BASE_ID";
	if (useLocalSupabase) {
		errorMessage += ", VITE_LOCAL_SUPABASE_URL, VITE_LOCAL_SUPABASE_ANON_KEY.";
	} else {
		errorMessage += ", VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.";
	}
	console.error(errorMessage);
	process.exit(1);
}

const base = new Airtable({ apiKey: airtableApiKey }).base(airtableBaseId!);
// const pool = new Pool({ connectionString: supabaseConnectionString });
const supabase: SupabaseClient = createClient(supabaseUrl!, supabaseKey!);

// ---- Type Definitions (for data mapping) ----

// New Types for Airtable Attachments
interface Thumbnail {
	url: string;
	width: number;
	height: number;
}

interface AirtableAttachment {
	id: string;
	width: number;
	height: number;
	url: string;
	filename: string;
	size: number;
	type: string;
	thumbnails: {
		small: Thumbnail;
		large: Thumbnail;
		full: Thumbnail;
	};
}

// Simplified to fetch only necessary fields from Airtable
interface AirtableExerciseFields {
	"Current Name"?: string;
	"vimeo video"?: string; // Source for vimeo_code
	"Public Name (from Equipment)"?: string[]; 
	"Over Sort Category"?: string;
	"Explination 1"?: string; 
	"Explination 2"?: string;
	"Explanation 3"?: string; 
	"Explanation 4"?: string; 
	"Status (from look)"?: AirtableAttachment[]; // Source for thumbnails
	[key: string]: any; 
}

// Simplified to only include the target Supabase columns
interface SupabaseExercise {
	airtable_record_id: string;
	current_name?: string;
	vimeo_code?: string;
	equipment_public_name?: string; 
	over_sort_category?: string;
	explanation_1?: string;
	explanation_2?: string;
	explanation_3?: string;
	explanation_4?: string;
	thumbnail?: string; // New combined thumbnail field
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
	"auto_order"?: number;
	[key: string]: any;
}

interface SupabaseIndividualBlock {
	auto_order: number;
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

	try {
		const { data, error } = await supabase
			.from(tableName)
			.upsert(records, {
				onConflict: conflictColumn,
			});

		if (error) {
			console.error(`Error upserting into ${tableName}:`);
			console.error(`  Message: ${error.message}`);
			console.error(`  Details: ${error.details}`);
			console.error(`  Hint: ${error.hint}`);
			console.error(`  Code: ${error.code}`);
			throw error;
		}

		console.log(`Successfully upserted ${records.length} records into ${tableName}.`);
	} catch (error: any) {
		if (!(error && error.message && error.details)) {
			console.error(`Unhandled error during upsert into ${tableName}:`, error);
		}
		throw error;
	}
}

// Helper function for paginated select
async function selectAll(tableName: string, columns: string): Promise<any[]> {
	const PAGE_SIZE = 1000; // Supabase default limit
	let allData: any[] = [];
	let page = 0;
	let moreData = true;

	console.log(`[selectAll] Fetching all data from ${tableName} in pages...`);

	while (moreData) {
		const { data, error, count } = await supabase
			.from(tableName)
			.select(columns, { count: 'exact' }) // Request count for debugging/logging
			.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

		if (error) {
			console.error(`[selectAll] Error fetching page ${page} for ${tableName}:`, error);
			throw error;
		}

		if (data && data.length > 0) {
			allData = allData.concat(data);
			console.log(`[selectAll] Fetched page ${page} (${data.length} rows) for ${tableName}. Total fetched: ${allData.length}. Estimated total: ${count ?? 'N/A'}`); // Log count
			// Stop if we fetched less than a full page OR if we have fetched the total count (if available)
			if (data.length < PAGE_SIZE || (count !== null && allData.length >= count)) {
				moreData = false;
			} else {
				page++;
			}
		} else {
			moreData = false; // No more data found
		}
	}
	console.log(`[selectAll] Finished fetching. Total rows retrieved for ${tableName}: ${allData.length}`);
	return allData;
}

async function buildIdMap(tableName: string, airtableIdColumn: string = 'airtable_record_id', supabaseIdColumn: string = 'id'): Promise<Map<string, string>> {
	console.log(`[buildIdMap] Building ID map for ${tableName}.`);
	const idMap = new Map<string, string>();
	try {
		const data = await selectAll(tableName, `${supabaseIdColumn}, ${airtableIdColumn}`);

		if (data) {
			data.forEach((row: any) => {
				if (row[airtableIdColumn] && row[supabaseIdColumn]) {
					idMap.set(row[airtableIdColumn], row[supabaseIdColumn]);
				} else {
					console.warn(`[buildIdMap] Row in ${tableName} missing expected ID columns (airtableId: ${row[airtableIdColumn]}, supabaseId: ${row[supabaseIdColumn]}):`, row);
				}
			});
		}

	} catch (error) {
		if (!(error instanceof Error && (error.message.includes('[selectAll]') || error.message.includes('Error fetching IDs')))) {
			console.error(`[buildIdMap] Unhandled error building ID map for ${tableName}:`, error);
		}
		throw error;
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
			fields: [
				"Current Name", 
				"vimeo video",
				"Public Name (from Equipment)", 
				"Over Sort Category", 
				"Explination 1", "Explination 2", "Explanation 3", "Explanation 4", 
			]
		}).eachPage((pageRecords, fetchNextPage) => {
			pageRecords.forEach(record => airtableRecords.push(record as any));
			fetchNextPage();
		});

		console.log(`Fetched ${airtableRecords.length} records from Airtable Exercise Library.`);
		if (airtableRecords.length === 0) return;

		const supabaseExercises: SupabaseExercise[] = airtableRecords.map(record => {
			let vimeoCodeValue;
			const vimeoVideoField = record.fields["vimeo video"];
			if (typeof vimeoVideoField === 'string' && vimeoVideoField.includes('vimeo.com')) {
				const match = vimeoVideoField.match(/vimeo\.com\/(\d+)/);
				if (match && match[1]) {
					vimeoCodeValue = match[1];
				}
			} else if (typeof vimeoVideoField === 'number') {
				vimeoCodeValue = String(vimeoVideoField);
			}

			const publicNameFromEquipment = record.fields["Public Name (from Equipment)"];
			const newThumbnailUrl = vimeoCodeValue ? `https://vumbnail.com/${vimeoCodeValue}_medium.jpg` : undefined;

			return {
				airtable_record_id: record.id,
				current_name: record.fields["Current Name"],
				vimeo_code: vimeoCodeValue,
				equipment_public_name: Array.isArray(publicNameFromEquipment) ? publicNameFromEquipment.join(', ') : publicNameFromEquipment,
				over_sort_category: record.fields["Over Sort Category"],
				explanation_1: record.fields["Explination 1"],
				explanation_2: record.fields["Explination 2"],
				explanation_3: record.fields["Explanation 3"],
				explanation_4: record.fields["Explanation 4"],
				thumbnail: newThumbnailUrl,
			};
		});

		const columns = [
			'airtable_record_id', 'current_name', 'vimeo_code', 'equipment_public_name',
			'over_sort_category', 'explanation_1', 'explanation_2', 'explanation_3', 'explanation_4',
			'thumbnail'
		];
		await upsertRecords('exercise_library', supabaseExercises, 'airtable_record_id', columns);

	} catch (error) {
		console.error("Error syncing Exercise Library:", error);
		throw error;
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
		throw error;
	}
}

async function syncIndividualBlocks(exerciseIdMap: Map<string, string>, blockOverviewIdMap: Map<string, string>) {
	console.log("Starting sync for Individual Blocks...");

	const airtableRecords: Airtable.Record<AirtableIndividualBlockFields>[] = [];

	try {
		await base('individual blocks').select({
			fields: ["sets", "reps", "sets & reps", "unit", "special", "Exercise Name", "Block name", "auto order"]
		}).eachPage((pageRecords, fetchNextPage) => {
			pageRecords.forEach(record => airtableRecords.push(record as any));
			fetchNextPage();
		});

		console.log(`Fetched ${airtableRecords.length} records from Airtable Individual Blocks.`);
		if (airtableRecords.length === 0) return;

		const supabaseIndividualBlocks: SupabaseIndividualBlock[] = airtableRecords.map((record, index) => {
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
				auto_order: record.fields["auto order"]
			};
		});

		const columns = [
			'airtable_record_id', 'block_overview_id', 'airtable_block_overview_record_id',
			'exercise_id', 'airtable_exercise_record_id', 'sets', 'reps',
			'sets_and_reps_text', 'unit', 'special_instructions', 'auto_order'
		];
		await upsertRecords('individual_blocks', supabaseIndividualBlocks, 'airtable_record_id', columns);

	} catch (error) {
		console.error("Error syncing Individual Blocks:", error);
		throw error;
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
		throw error;
	}
}

async function main() {
	try {
		console.log("Starting sync for exercise_library...");
		await syncExerciseLibrary();
		console.log("Finished sync for exercise_library.");

		console.log("Starting sync for blocks_overview...");
		await syncBlocksOverview();
		console.log("Finished sync for blocks_overview.");

		console.log("Building ID maps...");
		const exerciseIdMap = await buildIdMap('exercise_library');
		const blockOverviewIdMap = await buildIdMap('blocks_overview');
		console.log("Finished building ID maps.");

		console.log("Starting sync for individual_blocks...");
		await syncIndividualBlocks(exerciseIdMap, blockOverviewIdMap);
		console.log("Finished sync for individual_blocks.");

		console.log("Starting sync for workouts...");
		await syncWorkouts(blockOverviewIdMap);
		console.log("Finished sync for workouts.");

		console.log("Sync process completed successfully.");
	} catch (error: any) {
		console.error("Main sync process failed overall:");
		if (error && error.message) {
			console.error("  Error Name:", error.name || 'N/A');
			console.error("  Error Message:", error.message);
			if (error.details) console.error("  Error Details:", error.details);
			if (error.hint) console.error("  Error Hint:", error.hint);
			if (error.code) console.error("  Error Code:", error.code);
			if (error.stack) console.error("  Error Stack:", error.stack);
		} else {
			console.error("  Raw Error:", error);
		}
	} finally {
		// await pool.end();
	}
}

main();