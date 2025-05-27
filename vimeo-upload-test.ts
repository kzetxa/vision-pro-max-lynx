// test-upload.ts
// A Node.js (ESM) script in TypeScript to test the Netlify Vimeo TUS upload function.
// Usage (with ts-node):
//   npm install -D ts-node typescript @types/node node-fetch tus-js-client mime-types
//   node --loader ts-node/esm test-upload.ts <path-to-video-file>

import fs from 'fs';
import path from 'path';
import fetch, { Response } from 'node-fetch';
import { Upload, UploadOptions } from 'tus-js-client';
import mime from 'mime-types';

interface VimeoInitResponse {
	uploadLink: string;
	videoUri: string;
}

async function main(): Promise<void> {
	const [filePath] = process.argv.slice(2);
	if (!filePath) {
		console.error('Usage: node test-upload.ts <path-to-video-file>');
		process.exit(1);
	}

	if (!fs.existsSync(filePath)) {
		console.error(`File not found: ${filePath}`);
		process.exit(1);
	}

	const fileName: string = path.basename(filePath);
	const fileSize: number = fs.statSync(filePath).size;
	const fileType: string = mime.lookup(filePath) || 'application/octet-stream';
	const fileStream: fs.ReadStream = fs.createReadStream(filePath);

	const functionUrl: string =
		process.env.NETLIFY_FUNCTION_URL ??
		'http://localhost:3000/.netlify/functions/vimeoCreateUpload';

	console.log(`Requesting TUS upload link from ${functionUrl}...`);
	const initRes: Response = await fetch(functionUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ size: fileSize, name: fileName })
	});

	if (!initRes.ok) {
		const errorText: string = await initRes.text();
		console.error('Failed to create Vimeo upload:', errorText);
		process.exit(1);
	}

	const { uploadLink, videoUri }: VimeoInitResponse =
		(await initRes.json()) as VimeoInitResponse;
	console.log('Received uploadLink:', uploadLink);
	console.log('Vimeo video URI:', videoUri);

	console.log('Starting TUS upload...');
	const options: UploadOptions = {
		uploadUrl: uploadLink,
		chunkSize: 5 * 1024 * 1024, // 5 MB
		retryDelays: [0, 1000, 3000, 5000],
		metadata: {
			filename: fileName,
			filetype: fileType
		},
		onError(error: Error): void {
			console.error('Upload failed:', error);
			process.exit(1);
		},
		onProgress(bytesUploaded: number, bytesTotal: number): void {
			const percentage: string = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
			process.stdout.write(`\rProgress: ${percentage}% (${bytesUploaded}/${bytesTotal})`);
		},
		onSuccess(): void {
			console.log(`\nUpload complete! Video available at: https://vimeo.com${videoUri}`);
			process.exit(0);
		}
	};

	const upload: Upload = new Upload(fileStream, options);
	upload.start();
}

main().catch((err: unknown) => {
	console.error('Unexpected error:', err);
	process.exit(1);
});
