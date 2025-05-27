import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Airtable from 'airtable';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface RequestBody {
  vimeo_code: string;
  supabase_exercise_id: string | number;
}

interface SupabaseExerciseData {
  airtable_record_id: string;
}

const getEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let vimeo_code: string;
  let supabase_exercise_id: string | number;

  try {
    if (!event.body) {
      return { statusCode: 400, body: 'Request body is missing' };
    }
    const body = JSON.parse(event.body) as RequestBody;
    vimeo_code = body.vimeo_code;
    supabase_exercise_id = body.supabase_exercise_id;
  } catch (e) {
    console.error('Error parsing request body:', e);
    return { statusCode: 400, body: 'Invalid JSON body' };
  }

  if (!vimeo_code || !supabase_exercise_id) {
    return { statusCode: 400, body: 'Missing vimeo_code or supabase_exercise_id' };
  }

  const supabaseUrl = getEnv('VITE_SUPABASE_URL');
  const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');
  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

  const airtableApiKey = getEnv('VITE_AIRTABLE_API_KEY');
  const airtableBaseId = getEnv('VITE_AIRTABLE_BASE_ID');
  const airtableVideoTableId = getEnv('VITE_AIRTABLE_VIDEO_FEEDBACK_ID');

  Airtable.configure({ apiKey: airtableApiKey });
  const base = Airtable.base(airtableBaseId);
  const videoTable = base(airtableVideoTableId);

  try {
    const { data: exerciseData, error: supabaseError } = await supabase
      .from('exercise_library')
      .select('airtable_record_id')
      .eq('id', supabase_exercise_id)
      .single<SupabaseExerciseData>();

    if (supabaseError) {
      console.error('Error fetching exercise from Supabase:', supabaseError);
      return { statusCode: 500, body: `Error fetching exercise data from Supabase: ${supabaseError.message}` };
    }
    if (!exerciseData) {
      return { statusCode: 404, body: `Exercise with Supabase ID ${supabase_exercise_id} not found.` };
    }

    const airtableExerciseRecordId = exerciseData.airtable_record_id;
    if (!airtableExerciseRecordId) {
      return { statusCode: 404, body: `Airtable record ID not found for Supabase exercise ID ${supabase_exercise_id}` };
    }

    const existingRecords = await videoTable.select({
      filterByFormula: `{vimeo_code} = "${vimeo_code}"`,
      maxRecords: 1,
    }).firstPage();

    if (existingRecords && existingRecords.length > 0) {
      const existingRecordId = existingRecords[0].id;
      console.log(`Record for vimeo_code ${vimeo_code} already exists in Airtable (ID: ${existingRecordId}).`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Record already exists in Airtable.', airtableRecordId: existingRecordId }),
      };
    } else {
      const newRecords = await videoTable.create([
        {
          fields: {
            'vimeo_code': vimeo_code,
            'exercise_id': [airtableExerciseRecordId],
          },
        },
      ]);

      if (!newRecords || newRecords.length === 0) {
        throw new Error('Airtable record creation returned no records.');
      }
      console.log('Successfully created record in Airtable:', newRecords[0].id);
      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'Record created successfully in Airtable.', airtableRecordId: newRecords[0].id }),
      };
    }
  } catch (error: any) {
    console.error('Error processing Airtable request:', error);
    if (error.message.startsWith('Missing environment variable:')) {
        return { statusCode: 500, body: error.message };
    }
    return { statusCode: 500, body: `Internal Server Error: ${error.message || String(error)}` };
  }
}; 