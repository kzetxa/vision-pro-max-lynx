import * as tus from "tus-js-client";

interface VimeoUploadParams {
  file: File;
  accessToken: string; // Your Vimeo API access token
  videoName?: string;
  videoDescription?: string;
  onProgress?: (progress: number) => void; // Callback for upload progress (0-100)
  // Add other metadata parameters as needed (e.g., privacy settings)
}

interface VimeoUploadResponse {
  success: boolean;
  videoId?: string; // Vimeo video ID upon successful upload
  error?: string;
  // Include other relevant response data from Vimeo
}

interface InitiateVimeoUploadParams {
  file: File;
  videoName?: string;
  videoDescription?: string;
  onProgress?: (progress: number) => void; // For TUS upload progress
}

interface VimeoUploadDetails {
  uploadLink: string;
  videoUri: string;
  videoName: string;
}

/**
 * Step 1: Calls our Netlify function to create a video object on Vimeo and get an upload ticket.
 */
const getVideoUploadTicket = async (
	file: File,
	videoName?: string,
	videoDescription?: string,
): Promise<{ uploadLink: string; videoUri: string; finalVideoName: string } | { error: string }> => {
	try {
		const response = await fetch("/.netlify/functions/vimeo-create-upload", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				fileSize: file.size,
				videoName: videoName || file.name,
				videoDescription: videoDescription || "",
			}),
		});

		const responseData = await response.json();

		if (!response.ok) {
			console.error("Error from vimeo-create-upload Netlify function:", responseData);
			return { error: responseData.error || "Failed to get Vimeo upload ticket from server." };
		}
		if (!responseData.uploadLink || !responseData.videoUri) {
			console.error("Missing uploadLink or videoUri from Netlify function response:", responseData);
			return { error: "Server response for creating upload ticket was incomplete." };
		}
		return {
			uploadLink: responseData.uploadLink,
			videoUri: responseData.videoUri,
			finalVideoName: responseData.videoName,
		};
	} catch (error: any) {
		console.error("Network or parsing error calling vimeo-create-upload Netlify function:", error);
		return { error: error.message || "Failed to communicate with the server to start Vimeo upload." };
	}
};

/**
 * Step 2 & 3: Uploads the video file to Vimeo using the TUS protocol and verifies.
 * Uses tus-js-client library.
 */
const tusUploadAndVerify = (
	uploadLink: string,
	file: File,
	videoName: string, // Used for metadata in tus-js-client
	onProgress?: (progress: number) => void,
): Promise<{ success: boolean; error?: string }> => {
	return new Promise((resolve, reject) => {
		console.log(`Starting TUS upload for ${file.name} to ${uploadLink}`);

		const upload = new tus.Upload(file, {
			endpoint: uploadLink, // This is the upload.upload_link from Vimeo API
			retryDelays: [0, 3000, 5000, 10000, 20000], // Retry delays in ms
			metadata: {
				filename: videoName, // Vimeo might use the name set in Step 1, but good to include
				filetype: file.type,
			},
			headers: {
				// Vimeo's TUS implementation uses the endpoint URL directly and doesn't require
				// additional Authorization headers for the PATCH requests once the uploadLink is obtained.
				// The `Tus-Resumable`, `Upload-Offset`, `Content-Type` headers are handled by tus-js-client.
			},
			onError: (error): void => {
				console.error("Failed during TUS upload:", error);
				resolve({ success: false, error: `TUS upload failed: ${error.message}` });
			},
			onProgress: (bytesUploaded, bytesTotal): void => {
				const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
				onProgress?.(percentage);
				// console.log(bytesUploaded, bytesTotal, percentage + "%");
			},
			onSuccess: (): void => {
				console.log(`Successfully uploaded ${videoName} via TUS to Vimeo.`);
				// With TUS, onSuccess typically means the entire file is on the server.
				// Vimeo documentation for resumable uploads implies PATCH success (Upload-Offset === file.size)
				// or HEAD request verification is how you confirm. tus-js-client handles this.
				resolve({ success: true });
			},
			// The `uploadUrl` property of the `tus.Upload` instance might be useful if you need
			// to store it for resuming later across sessions, though this example completes in one go.
		});

		// Start the upload
		upload.start();
	});
};

/**
 * Main utility to upload a video. It first gets an upload ticket via our Netlify function,
 * then performs the TUS upload directly to Vimeo.
 */
export const uploadVideoToVimeo = async (params: InitiateVimeoUploadParams): Promise<VimeoUploadResponse> => {
	const { file, videoName, videoDescription, onProgress } = params;

	console.log(`Initiating Vimeo upload for ${file.name}...`);

	// Step 1: Get upload ticket from our Netlify function
	const ticketResult = await getVideoUploadTicket(file, videoName, videoDescription);
	if ("error" in ticketResult) {
		return { success: false, error: ticketResult.error };
	}

	const { uploadLink, videoUri, finalVideoName } = ticketResult;

	// Step 2 & 3: Perform TUS upload and verification
	const tusResult = await tusUploadAndVerify(uploadLink, file, finalVideoName || file.name, onProgress);
	if (!tusResult.success) {
		return { success: false, error: tusResult.error || "TUS upload failed." };
	}

	const videoId = videoUri?.split("/").pop();
	console.log(`Successfully uploaded video. Vimeo Video ID: ${videoId}, URI: ${videoUri}`);

	return {
		success: true,
		videoId: videoId,
	};
}; 