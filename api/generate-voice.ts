import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface RequestBody {
	exerciseId: string;
	text: string;
	language?: string; // Optional language parameter - defaults to 'en'
}

// Supported languages for ElevenLabs multilingual model
const SUPPORTED_LANGUAGES = {
	'en': 'English',
	'es': 'Spanish',
	'fr': 'French',
	'de': 'German',
	'it': 'Italian',
	'pt': 'Portuguese',
	'pl': 'Polish',
	'hi': 'Hindi',
	'ja': 'Japanese',
	'ko': 'Korean',
	'zh': 'Chinese',
	'ru': 'Russian',
	'ar': 'Arabic',
	'nl': 'Dutch',
	'sv': 'Swedish',
	'da': 'Danish',
	'no': 'Norwegian',
	'fi': 'Finnish',
	'tr': 'Turkish',
	'he': 'Hebrew',
	'th': 'Thai',
	'vi': 'Vietnamese',
	'cs': 'Czech',
	'sk': 'Slovak',
	'hu': 'Hungarian',
	'ro': 'Romanian',
	'bg': 'Bulgarian',
	'hr': 'Croatian',
	'sl': 'Slovenian',
	'et': 'Estonian',
	'lv': 'Latvian',
	'lt': 'Lithuanian',
	'el': 'Greek',
	'id': 'Indonesian',
	'ms': 'Malay',
	'uk': 'Ukrainian',
	'be': 'Belarusian',
	'ka': 'Georgian',
	'hy': 'Armenian',
	'az': 'Azerbaijani',
	'kk': 'Kazakh',
	'ky': 'Kyrgyz',
	'uz': 'Uzbek',
	'tg': 'Tajik',
	'tm': 'Turkmen',
	'mn': 'Mongolian',
	'my': 'Burmese',
	'km': 'Khmer',
	'lo': 'Lao',
	'ne': 'Nepali',
	'si': 'Sinhala',
	'bn': 'Bengali',
	'ur': 'Urdu',
	'fa': 'Persian',
	'ps': 'Pashto',
	'ku': 'Kurdish',
	'yi': 'Yiddish',
	'am': 'Amharic',
	'sw': 'Swahili',
	'zu': 'Zulu',
	'af': 'Afrikaans',
	'xh': 'Xhosa',
	'st': 'Southern Sotho',
	'tn': 'Tswana',
	'ts': 'Tsonga',
	've': 'Venda',
	'nr': 'Southern Ndebele',
	'ss': 'Swati',
	'nd': 'Northern Ndebele',
	'rw': 'Kinyarwanda',
	'lg': 'Ganda',
	'ak': 'Akan',
	'yo': 'Yoruba',
	'ig': 'Igbo',
	'ha': 'Hausa',
	'ff': 'Fulah',
	'wo': 'Wolof',
	'sn': 'Shona'
};

// Helper function to get available languages
export const getSupportedLanguages = () => {
	return SUPPORTED_LANGUAGES;
};

const storeVoice = async (buffer: Buffer, filename: string, text: string, exerciseId: string, language: string, supabase: SupabaseClient): Promise<string> => {
	const accessKeyId = process.env.STEPHEN_AWS_ACCESS_KEY_ID;
	const secretAccessKey = process.env.STEPHEN_AWS_SECRET_ACCESS_KEY;
	const region = process.env.STEPHEN_AWS_REGION || 'us-west-2';
	if (!accessKeyId || !secretAccessKey) {
		throw new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is not set');
	}

	const s3 = new S3Client({ 
		region: 'us-west-2',
		credentials: {
			accessKeyId: process.env.STEPHEN_AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.STEPHEN_AWS_SECRET_ACCESS_KEY!,
		}
	});

	const s3Bucket = process.env.S3_BUCKET;
	if (!s3Bucket) {
		throw new Error('S3_BUCKET is not set');
	}

	// Upload to S3
	await s3.send(new PutObjectCommand({
		Bucket: s3Bucket,
		Key: filename,
		Body: buffer,
		ContentType: 'audio/mpeg',
	}));

	const url = `https://${s3Bucket}.s3.${region}.amazonaws.com/${filename}`;

	const { error } = await supabase
		.from('exercise_library')
		.update({ voice: url, voice_language: language })
		.eq('id', exerciseId);

	if (error) {
		console.error('Supabase update failed:', error);
	}

	return url;
}

const fetchElevenLabsAudio = async (text: string, language?: string): Promise<Buffer> => {
	const headers = new Headers()
	headers.append('Content-Type', 'application/json')
	if (process.env.ELEVENLABS_API_KEY) {
		headers.append('xi-api-key', process.env.ELEVENLABS_API_KEY)
	}

	// Use multilingual model for different languages
	const modelId = language && language !== 'en' ? "eleven_multilingual_v2" : "eleven_turbo_v2_5";

	const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`, {
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			text,
			model_id: modelId,
			voice_settings: {
				stability: 0.4,
				similarity_boost: 0.75,
				style: 0.1,
				use_speaker_boost: true
			},
			optimize_streaming_latency: 0
		})
	});

	if (!res.ok) throw new Error('TTS generation failed')
	return Buffer.from(await res.arrayBuffer())
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
	try {
		let exerciseId: string | undefined;
		let text: string | undefined;
		let language: string = 'en'; // Default to English
		try {
			if (!event.body) {
				return { statusCode: 400, body: 'Request body is missing' };
			}
			const body = JSON.parse(event.body) as RequestBody;
			exerciseId = body.exerciseId;
			text = body.text;
			language = body.language || 'en'; // Default to English if not specified
		} catch (e) {
			console.error('Error parsing request body:', e);
			return { statusCode: 400, body: 'Invalid JSON body' };
		}

		if (!text) {
			return { statusCode: 400, body: 'Missing text input' };
		}

		if (!exerciseId) {
			return { statusCode: 400, body: 'Missing exerciseId input' };
		}

		// first check if the voice already exists in supabase
		// TODO: figure out a way to use local supabase when in development mode
		const supabaseUrl = process.env.VITE_LOCAL_SUPABASE_URL;
		if (!supabaseUrl) {
			throw new Error('SUPABASE_URL is not set');
		}

		const supabaseKey = process.env.VITE_LOCAL_SUPABASE_ANON_KEY;
		if (!supabaseKey) {
			throw new Error('SUPABASE_ANON_KEY is not set');
		}

		// Update Supabase
		const supabase = createClient(supabaseUrl, supabaseKey);
		
		const { data, error } = await supabase
			.from("exercise_library")
			.select("voice, voice_language")
			.eq("id", exerciseId)
			.single();

		if (error && error.code !== "PGRST116") { // PGRST116: "Searched for a single row, but 0 rows were found"
			console.error("Error fetching exercise voice from Supabase:", error);
		}

		// Check if voice exists and matches the requested language
		if (data?.voice && data?.voice_language === language) {
			return {
				statusCode: 200,
				body: JSON.stringify({ url: data.voice })
			};
		}

		let audioBuffer: Buffer | null = null;
		try {
			// Generate voice using ElevenLabs
			audioBuffer = await fetchElevenLabsAudio(text, language)
		} catch (e) {
			console.error('Error generating voice:', e);
			return { statusCode: 500, body: 'Error generating voice' };
		}

		try {
			// Store voice in S3 and Supabase
			const filename = `${uuidv4()}.mp3`
			const url = await storeVoice(audioBuffer, filename, text, exerciseId, language, supabase)
			return { 
				statusCode: 200, 
				body: JSON.stringify({ url })
			};
		} catch (e) {
			console.error('Error storing voice:', e);
			return { statusCode: 500, body: 'Error storing voice' };
		}

	} catch (error) {
		return { 
			statusCode: 500, 
			body: error.toString() 
		};
	}
}
