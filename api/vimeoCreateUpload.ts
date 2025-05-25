// api/vimeoCreateUpload.ts (or .js if not using TypeScript)
// Netlify Function "vimeoCreateUpload" initializes a Vimeo TUS upload
// and returns the upload endpoint (uploadLink) and the video URI (videoUri).

import fetch from 'node-fetch';

export async function handler(event, context) {
	console.log('--- vimeoCreateUpload invoked ---');
	console.log('Received event:', JSON.stringify(event, null, 2));

	if (event.httpMethod !== 'POST') {
		console.log('🛑 Invalid HTTP method:', event.httpMethod);
		return {
			statusCode: 405,
			headers: { Allow: 'POST' },
			body: 'Method Not Allowed'
		};
	}

	let payload;
	try {
		payload = JSON.parse(event.body);
		console.log('✅ Parsed payload:', payload);
	} catch (err) {
		console.error('🛑 Invalid JSON in request body:', err.message);
		return { statusCode: 400, body: 'Invalid JSON' };
	}

	const { size, name } = payload;
	console.log(`📦 Video metadata - size: ${size}, name: "${name}"`);

	const token = process.env.VITE_VIMEO_ACCESS_TOKEN;
	if (!token) {
		console.log('VITE_VIMEO_ACCESS_TOKEN:', process.env.VITE_VIMEO_ACCESS_TOKEN);
		console.error('🛑 VITE_VIMEO_ACCESS_TOKEN environment variable is not set');
		return { statusCode: 500, body: 'Server configuration error' };
	}

	try {
		const requestBody = { upload: { approach: 'tus', size }, name };
		console.log('📤 Sending request to Vimeo API:', JSON.stringify(requestBody, null, 2));

		const createRes = await fetch('https://api.vimeo.com/me/videos', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
				Accept: 'application/vnd.vimeo.*+json;version=3.4'
			},
			body: JSON.stringify(requestBody)
		});

		console.log(`⬅️ Vimeo API response: ${createRes.status} ${createRes.statusText}`);
		const resText = await createRes.text();
		console.log('📥 Raw response body:', resText);

		if (!createRes.ok) {
			console.error('🛑 Vimeo API error:', resText);
			return { statusCode: createRes.status, body: resText };
		}

		const createData = JSON.parse(resText);
		console.log('✅ Vimeo API parsed data:', JSON.stringify(createData, null, 2));

		const uploadLink = createData.upload.upload_link;
		const videoUri = createData.uri;
		console.log(`🔗 uploadLink: ${uploadLink}`);
		console.log(`🎥 videoUri: ${videoUri}`);

		const responsePayload = { uploadLink, videoUri };
		console.log('📤 Returning response payload:', JSON.stringify(responsePayload, null, 2));

		return {
			statusCode: 200,
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(responsePayload)
		};
	} catch (err) {
		console.error('💥 Internal server error:', err.stack || err.message);
		return { statusCode: 500, body: 'Internal server error - test 872' };
	}
}
