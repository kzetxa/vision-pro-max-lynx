import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import type {
  AirtableListResponse,
  WorkoutWithBlock1PreviewFields,
  BlockFields,
  BlockPreviewFields,
  AirtableRecord
} from "../src/lib/types";

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appp2JjMRlSvTyvVY';
const AIRTABLE_TABLE_ID_WORKOUTS = 'tblqdC3fWyvyFMBxv';
const AIRTABLE_TABLE_ID_BLOCKS = 'tbloYDsl2c56zGndO';
const AIRTABLE_VIEW_WORKOUT_PROTO = 'workout-proto';

// Helper to fetch a single minimal block record for preview
async function fetchBlockPreview(blockId: string): Promise<BlockPreviewFields | undefined> {
  if (!AIRTABLE_API_KEY || !blockId) return undefined;
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID_BLOCKS}/${blockId}`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } });
    if (!response.ok) {
      console.error(`Airtable API Error fetching block ${blockId} for preview: ${response.status} - ${await response.text()}`);
      return undefined;
    }
    const blockRecord = await response.json() as AirtableRecord<BlockFields>; // Fetch full block initially
    // Return only the preview fields
    return {
      "Public Name": blockRecord.fields["Public Name"],
      "card for preview": blockRecord.fields["card for preview"],
    };
  } catch (error) {
    console.error(`Network error fetching block ${blockId} for preview:`, error);
    return undefined;
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

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID_WORKOUTS}?view=${AIRTABLE_VIEW_WORKOUT_PROTO}`;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Airtable API Error: ${response.status} - ${errorBody}`);
      return { statusCode: response.status, body: `Airtable error: ${response.statusText}` };
    }

    const listResponse: AirtableListResponse<WorkoutWithBlock1PreviewFields> = await response.json();

    // Post-process to fetch Block 1 previews
    const populatedRecords = await Promise.all(
      listResponse.records.map(async (workoutRecord) => {
        const block1Ids = workoutRecord.fields["Block 1"];
        if (block1Ids && block1Ids.length > 0) {
          const block1Preview = await fetchBlockPreview(block1Ids[0]);
          if (block1Preview) {
            //workoutRecord.fields.resolvedBlock1Preview = block1Preview; // This mutates, ensure type compatibility
            return {
                ...workoutRecord,
                fields: {
                    ...workoutRecord.fields,
                    resolvedBlock1Preview: block1Preview
                }
            }
          }
        }
        return workoutRecord; // Return original if no block 1 or fetch fails
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ ...listResponse, records: populatedRecords }),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error: any) {
    console.error('Error fetching workouts:', error);
    return { statusCode: 500, body: `Server error: ${error.toString()}` };
  }
};

export { handler }; 