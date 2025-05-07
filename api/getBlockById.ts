import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import type {
  AirtableRecord,
  BlockFields,
  Exercise,
  ExerciseFields, // For fetching individual exercises
  PopulatedBlock // The final shape we want to return
} from "../src/lib/types";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appp2JjMRlSvTyvVY';
const AIRTABLE_TABLE_ID_BLOCKS = 'tbloYDsl2c56zGndO';
const AIRTABLE_TABLE_ID_EXERCISES = 'tbl8PKDZMG5nv73Hx';

// Helper function to fetch a single record by ID from any table
async function fetchAirtableRecord<TFields>(tableId: string, recordId: string): Promise<AirtableRecord<TFields> | null> {
  if (!AIRTABLE_API_KEY) {
    console.error('Airtable API key not configured for fetchAirtableRecord.');
    // In a real app, might throw or return a more specific error object
    return null;
  }
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}/${recordId}`;
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      console.error(`Airtable API Error fetching record ${recordId} from ${tableId}: ${response.status} - ${await response.text()}`);
      return null; // Or throw an error
    }
    return await response.json() as AirtableRecord<TFields>;
  } catch (error) {
    console.error(`Network error fetching record ${recordId} from ${tableId}:`, error);
    return null; // Or throw an error
  }
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!AIRTABLE_API_KEY) {
    console.error('Airtable API key not configured.');
    return { statusCode: 500, body: 'Airtable API key not configured.' };
  }

  const blockId = event.queryStringParameters?.id;

  if (!blockId) {
    return { statusCode: 400, body: 'Block ID is required' };
  }

  try {
    const blockRecord = await fetchAirtableRecord<BlockFields>(AIRTABLE_TABLE_ID_BLOCKS, blockId);

    if (!blockRecord) {
      return { statusCode: 404, body: `Block with ID ${blockId} not found.` };
    }

    let resolvedExercises: Exercise[] = [];
    const exerciseIds = blockRecord.fields.Exercises;

    if (exerciseIds && exerciseIds.length > 0) {
      const exercisePromises = exerciseIds.map(exerciseId =>
        fetchAirtableRecord<ExerciseFields>(AIRTABLE_TABLE_ID_EXERCISES, exerciseId)
      );
      const fetchedExerciseRecords = await Promise.all(exercisePromises);
      
      resolvedExercises = fetchedExerciseRecords.filter(
        (exRecord): exRecord is AirtableRecord<ExerciseFields> => exRecord !== null
      ) as Exercise[];
    }

    // Construct the fields for PopulatedBlock
    // Start with all fields from the original blockRecord.fields
    const populatedFields: any = { ...blockRecord.fields }; // Use 'any' temporarily
    // Add resolvedExercises
    if (resolvedExercises.length > 0) {
      populatedFields.resolvedExercises = resolvedExercises;
    }
    // Remove the original Exercises (array of IDs) as it's replaced by resolvedExercises
    delete populatedFields.Exercises;
    
    const populatedBlock: PopulatedBlock = {
      id: blockRecord.id,
      createdTime: blockRecord.createdTime,
      fields: populatedFields as PopulatedBlock["fields"], // Cast to the correct type
    };

    return {
      statusCode: 200,
      body: JSON.stringify(populatedBlock),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  } catch (error: any) {
    console.error(`Error processing block ${blockId}:`, error);
    return { statusCode: 500, body: `Server error: ${error.toString()}` };
  }
};

export { handler }; 