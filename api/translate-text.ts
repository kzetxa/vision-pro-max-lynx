import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface RequestBody {
	text: string;
	targetLanguage: string;
}

const translateText = async (text: string, targetLanguage: string): Promise<string> => {
	const openaiApiKey = process.env.OPENAI_API_KEY;
	if (!openaiApiKey) {
		throw new Error('OPENAI_API_KEY is not set');
	}

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${openaiApiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are a translator. Translate the given text to ${targetLanguage}. Only return the translated text, nothing else.`
				},
				{
					role: 'user',
					content: text
				}
			],
			max_tokens: 500,
			temperature: 0.3
		})
	});

	if (!response.ok) {
		throw new Error(`OpenAI API error: ${response.status}`);
	}

	const data = await response.json();
	return data.choices[0].message.content.trim();
};

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
	try {
		let text: string | undefined;
		let targetLanguage: string | undefined;
		
		try {
			if (!event.body) {
				return { statusCode: 400, body: 'Request body is missing' };
			}
			const body = JSON.parse(event.body) as RequestBody;
			text = body.text;
			targetLanguage = body.targetLanguage;
		} catch (e) {
			console.error('Error parsing request body:', e);
			return { statusCode: 400, body: 'Invalid JSON body' };
		}

		if (!text) {
			return { statusCode: 400, body: 'Missing text input' };
		}

		if (!targetLanguage) {
			return { statusCode: 400, body: 'Missing targetLanguage input' };
		}

		// If target language is English, return original text
		if (targetLanguage === 'en') {
			return {
				statusCode: 200,
				body: JSON.stringify({ translatedText: text })
			};
		}

		try {
			const translatedText = await translateText(text, targetLanguage);
			return {
				statusCode: 200,
				body: JSON.stringify({ translatedText })
			};
		} catch (e) {
			console.error('Error translating text:', e);
			return { statusCode: 500, body: 'Error translating text' };
		}

	} catch (error) {
		return { 
			statusCode: 500, 
			body: error.toString() 
		};
	}
}; 