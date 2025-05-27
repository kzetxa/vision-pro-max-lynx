import * as tus from "tus-js-client";

export interface VimeoUploadResponse {
	success: boolean;
	videoId?: string;
	error?: string;
}

interface InitiateVimeoUploadParams {
	file: File;
	videoName?: string;
	videoDescription?: string;
	onProgress?: (progress: number) => void;
}

/**
 * Step 1: Calls your Netlify Function to initialize a Vimeo TUS upload
 */
const getVideoUploadTicket = async (
	file: File,
	videoName?: string,
	videoDescription?: string,
): Promise<
	{ uploadLink: string; videoUri: string; finalVideoName: string } | { error: string }
> => {
	try {
		const response = await fetch("/.netlify/functions/vimeoCreateUpload", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				size: file.size,
				name: videoName || file.name,
				description: videoDescription || "",
			}),
		});

		const responseData = await response.json();

		if (!response.ok) {
			console.error("Error from Netlify function:", responseData);
			return {
				error: responseData.error || "Failed to get Vimeo upload ticket from server.",
			};
		}

		if (!responseData.uploadLink || !responseData.videoUri) {
			console.error("Missing uploadLink or videoUri from server:", responseData);
			return { error: "Incomplete response from server." };
		}

		return {
			uploadLink: responseData.uploadLink,
			videoUri: responseData.videoUri,
			finalVideoName: videoName || file.name,
		};
	} catch (error: any) {
		console.error("Network or parsing error:", error);
		return {
			error: error.message || "Failed to communicate with server.",
		};
	}
};

/**
 * Step 2: Upload the video using tus-js-client
 */
const tusUploadAndVerify = (
	uploadLink: string,
	file: File,
	videoName: string,
	onProgress?: (progress: number) => void,
): Promise<{ success: boolean; error?: string }> => {
	return new Promise((resolve) => {
		console.log(`Starting TUS upload for ${file.name}`);

		const upload = new tus.Upload(file, {
			endpoint: getVimeoTusEndpoint(uploadLink),
			uploadUrl: uploadLink,
			retryDelays: [0, 3000, 5000, 10000, 20000],
			metadata: {
				filename: videoName,
				filetype: file.type,
			},
			onError: (error): void => {
				console.error("TUS upload error:", error);
				resolve({ success: false, error: `TUS upload failed: ${error.message}` });
			},
			onProgress: (bytesUploaded, bytesTotal): void => {
				const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
				onProgress?.(percentage);
			},
			onSuccess: (): void => {
				console.log(`✅ Successfully uploaded: ${videoName}`);
				resolve({ success: true });
			},
		});

		upload.start();
	});
};

/**
 * Step 3: Main upload handler
 */
export const uploadVideoToVimeo = async (params: InitiateVimeoUploadParams): Promise<VimeoUploadResponse> => {
	const { file, videoName, videoDescription, onProgress } = params;

	console.log(`📼 Upload initiated for ${file.name}`);

	const ticketResult = await getVideoUploadTicket(file, videoName, videoDescription);
	if ("error" in ticketResult) return { success: false, error: ticketResult.error };

	const { uploadLink, videoUri, finalVideoName } = ticketResult;

	const tusResult = await tusUploadAndVerify(uploadLink, file, finalVideoName, onProgress);
	if (!tusResult.success) return { success: false, error: tusResult.error };

	const videoId = videoUri.split("/").pop();
	return { success: true, videoId };
};

/**
 * Extracts the base TUS endpoint from a Vimeo upload link.
 * For example:
 *   "https://global.upload.vimeo.com/tus/uploads/0ItGAQeARIfZOLZ4VW9HpM?token=..."
 * becomes:
 *   "https://global.upload.vimeo.com/tus/"
 */
export function getVimeoTusEndpoint(uploadLink: string): string {
	// Match up to and including '/tus/'
	const idx = uploadLink.indexOf("/tus/");
	if (idx !== -1) {
		return uploadLink.substring(0, idx + 5); // include '/tus/'
	}
	throw new Error("Invalid Vimeo upload link format");
}