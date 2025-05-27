// api/get-video-feedbacks.ts
import Airtable, { FieldSet, Record } from 'airtable';
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface RequestBody {
	vimeo_codes: string[];
}

// This interface describes the structure of the 'fields' object within an Airtable Record
interface AirtableFeedbackRecordFields extends FieldSet {
	vimeo_code: string;
	feedback?: string; // Feedback might be optional
}

interface FeedbackResponse {
	vimeo_code: string;
	feedback: string | null;
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

	let vimeo_codes: string[];

	try {
		if (!event.body) {
			return { statusCode: 400, body: 'Request body is missing' };
		}
		const body = JSON.parse(event.body) as RequestBody;
		vimeo_codes = body.vimeo_codes;

		if (!Array.isArray(vimeo_codes) || vimeo_codes.some(c => typeof c !== 'string')) {
			return { statusCode: 400, body: 'Invalid or malformed vimeo_codes array in request body. Expected string[].' };
		}
	} catch (e) {
		console.error('Error parsing request body:', e);
		return { statusCode: 400, body: 'Invalid JSON body' };
	}

	if (vimeo_codes.length === 0) {
		return { statusCode: 200, body: JSON.stringify([]) };
	}

	try {
		const airtableApiKey = getEnv('VITE_AIRTABLE_API_KEY');
		const airtableBaseId = getEnv('VITE_AIRTABLE_BASE_ID');
		const airtableVideoTableId = getEnv('VITE_AIRTABLE_VIDEO_FEEDBACK_ID');

		Airtable.configure({ apiKey: airtableApiKey });
		const base = Airtable.base(airtableBaseId);
		const videoFeedbackTable = base(airtableVideoTableId);

		const formula = `OR(${vimeo_codes.map(code => `{vimeo_code} = "${code}"`).join(', ')})`;

		const records = (await videoFeedbackTable
			.select({
				filterByFormula: formula,
				fields: ['vimeo_code', 'feedback'],
			})
			.all()) as unknown as ReadonlyArray<Record<AirtableFeedbackRecordFields>>;

		const feedbackData: FeedbackResponse[] = records.map(record => ({
			vimeo_code: record.fields.vimeo_code,
			feedback: record.fields.feedback || null,
		}));

		return {
			statusCode: 200,
			body: JSON.stringify(feedbackData),
		};

	} catch (error: any) {
		console.error('Error fetching feedback from Airtable:', error);
		return { 
			statusCode: 500, 
			body: `Internal Server Error: ${error.message || String(error)}` 
		};
	}
};