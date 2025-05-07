import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import type {
  AirtableRecord,
  WorkoutFields,
  PopulatedWorkout,
  BlockFields,
  PopulatedBlock, // We will be constructing these
  ExerciseFields,
  Exercise
} from "../src/lib/types";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appp2JjMRlSvTyvVY';
const AIRTABLE_TABLE_ID_WORKOUTS = 'tblqdC3fWyvyFMBxv';
const AIRTABLE_TABLE_ID_BLOCKS = 'tbloYDsl2c56zGndO';
const AIRTABLE_TABLE_ID_EXERCISES = 'tbl8PKDZMG5nv73Hx';

// Helper function to fetch a single record by ID
async function fetchAirtableRecord<TFields>(tableId: string, recordId: string): Promise<AirtableRecord<TFields> | null> {
  if (!AIRTABLE_API_KEY) {
    console.error(`Airtable API key not configured for fetchAirtableRecord (table: ${tableId}, record: ${recordId}).`);
    return null;
  }
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } });
    if (!response.ok) {
      if (response.status === 404) return null;
      console.error(`Airtable API Error fetching record ${recordId} from ${tableId}: ${response.status} - ${await response.text()}`);
      return null;
    }
    return await response.json() as AirtableRecord<TFields>;
  } catch (error) {
    console.error(`Network error fetching record ${recordId} from ${tableId}:`, error);
    return null;
  }
}

// Helper function to fetch a block and populate its exercises
async function fetchAndPopulateBlock(blockId: string): Promise<PopulatedBlock | null> {
  const blockRecord = await fetchAirtableRecord<BlockFields>(AIRTABLE_TABLE_ID_BLOCKS, blockId);
  if (!blockRecord) return null;

  let resolvedExercises: Exercise[] = [];
  const exerciseIds = blockRecord.fields.Exercises;
  if (exerciseIds && exerciseIds.length > 0) {
    const exercisePromises = exerciseIds.map(exId => fetchAirtableRecord<ExerciseFields>(AIRTABLE_TABLE_ID_EXERCISES, exId));
    const fetchedExerciseRecords = await Promise.all(exercisePromises);
    resolvedExercises = fetchedExerciseRecords.filter((rec): rec is AirtableRecord<ExerciseFields> => rec !== null) as Exercise[];
  }

  const populatedFields: any = { ...blockRecord.fields };
  if (resolvedExercises.length > 0) {
    populatedFields.resolvedExercises = resolvedExercises;
  }
  delete populatedFields.Exercises; // Remove original array of IDs

  return {
    id: blockRecord.id,
    createdTime: blockRecord.createdTime,
    fields: populatedFields as PopulatedBlock["fields"],
  };
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!AIRTABLE_API_KEY) {
    console.error('Airtable API key not configured.');
    return { statusCode: 500, body: 'Airtable API key not configured.' };
  }

  const workoutId = event.queryStringParameters?.id;
  if (!workoutId) {
    return { statusCode: 400, body: 'Workout ID is required' };
  }

  try {
    const workoutRecord = await fetchAirtableRecord<WorkoutFields>(AIRTABLE_TABLE_ID_WORKOUTS, workoutId);
    if (!workoutRecord) {
      return { statusCode: 404, body: `Workout with ID ${workoutId} not found.` };
    }

    const { fields } = workoutRecord;
    let populatedBlock1: PopulatedBlock | undefined = undefined;
    let populatedBlock2: PopulatedBlock | undefined = undefined;
    let populatedBlock3: PopulatedBlock | undefined = undefined;

    if (fields["Block 1"] && fields["Block 1"].length > 0) {
      const block1 = await fetchAndPopulateBlock(fields["Block 1"][0]);
      if (block1) populatedBlock1 = block1;
    }
    if (fields["Block 2"] && fields["Block 2"].length > 0) {
      const block2 = await fetchAndPopulateBlock(fields["Block 2"][0]);
      if (block2) populatedBlock2 = block2;
    }
    if (fields["Block 3"] && fields["Block 3"].length > 0) {
      const block3 = await fetchAndPopulateBlock(fields["Block 3"][0]);
      if (block3) populatedBlock3 = block3;
    }
    
    const populatedWorkoutFields: any = { ...fields };
    if (populatedBlock1) populatedWorkoutFields.resolvedBlock1 = populatedBlock1;
    if (populatedBlock2) populatedWorkoutFields.resolvedBlock2 = populatedBlock2;
    if (populatedBlock3) populatedWorkoutFields.resolvedBlock3 = populatedBlock3;

    delete populatedWorkoutFields["Block 1"];
    delete populatedWorkoutFields["Block 2"];
    delete populatedWorkoutFields["Block 3"];

    const populatedWorkout: PopulatedWorkout = {
      id: workoutRecord.id,
      createdTime: workoutRecord.createdTime,
      fields: populatedWorkoutFields as PopulatedWorkout["fields"],
    };

    return {
      statusCode: 200,
      body: JSON.stringify(populatedWorkout),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error: any) {
    console.error(`Error processing workout ${workoutId}:`, error);
    return { statusCode: 500, body: `Server error: ${error.toString()}` };
  }
};

export { handler }; 