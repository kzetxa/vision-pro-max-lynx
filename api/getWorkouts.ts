import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import type {
  AirtableListResponse,
  WorkoutFields
} from "../src/lib/types";

const VITE_AIRTABLE_API_KEY = process.env.VITE_AIRTABLE_API_KEY;
const VITE_AIRTABLE_BASE_ID = 'appp2JjMRlSvTyvVY';
const AIRTABLE_TABLE_ID_WORKOUTS = 'tblqdC3fWyvyFMBxv';
const AIRTABLE_VIEW_WORKOUT_PROTO = 'workout-proto';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!VITE_AIRTABLE_API_KEY) {
    console.error('Airtable API key not configured.');
    return { statusCode: 500, body: 'Airtable API key not configured.' };
  }

  const url = `https://api.airtable.com/v0/${VITE_AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID_WORKOUTS}?view=${AIRTABLE_VIEW_WORKOUT_PROTO}`;

  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${VITE_AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Airtable API Error fetching workouts: ${response.status} - ${errorBody}`);
      return { statusCode: response.status, body: `Airtable error: ${response.statusText}` };
    }

    const listResponse: AirtableListResponse<WorkoutFields> = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(listResponse),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error: any) {
    console.error('Error fetching workouts:', error);
    return { statusCode: 500, body: `Server error: ${error.toString()}` };
  }
};

export { handler }; 