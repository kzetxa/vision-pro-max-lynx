import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Ensure your VIMEO_ACCESS_TOKEN is set as an environment variable in your Netlify settings.
const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_API_BASE_URL = "https://api.vimeo.com";

interface CreateUploadRequestBody {
  fileSize: number;      // Size of the video file in bytes
  videoName?: string;
  videoDescription?: string;
}

interface VimeoCreateVideoResponse {
  uri: string; // Example: "/videos/123456789"
  name: string;
  description: string | null;
  link: string; // Public link to the video page
  upload: {
    status: "in_progress" | "complete" | "error" | string; // Other statuses might exist
    upload_link: string; // The TUS upload URL
    form?: string; // HTML form for POST uploads (not used for TUS)
    approach: "tus" | "post" | "pull" | string;
    size: number;
    // ...other upload fields
  };
  // ...other video metadata fields
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
      headers: { "Content-Type": "application/json" },
    };
  }

  if (!VIMEO_ACCESS_TOKEN) {
    console.error("Vimeo access token is not configured in environment variables.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error: Vimeo token missing." }),
      headers: { "Content-Type": "application/json" },
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Request body is missing." }),
      headers: { "Content-Type": "application/json" },
    };
  }

  let requestBody: CreateUploadRequestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (parseError) {
    console.error("Error parsing request body:", parseError);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON in request body." }),
      headers: { "Content-Type": "application/json" },
    };
  }

  const { fileSize, videoName, videoDescription } = requestBody;

  if (typeof fileSize !== 'number' || fileSize <= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid or missing 'fileSize' in request body. It must be a positive number." }),
      headers: { "Content-Type": "application/json" },
    };
  }

  const vimeoApiRequestBody = {
    upload: {
      approach: "tus",
      size: fileSize, // Vimeo API documentation states this is an integer
    },
    name: videoName || `Uploaded Video - ${new Date().toISOString()}`,
    description: videoDescription || "",
    // You can add other parameters here, e.g., privacy settings
    // privacy: { view: "nobody" } // Example: make video private
  };

  try {
    const response = await fetch(`${VIMEO_API_BASE_URL}/me/videos`, {
      method: "POST",
      headers: {
        "Authorization": `bearer ${VIMEO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify(vimeoApiRequestBody),
    });

    const responseData: VimeoCreateVideoResponse | any = await response.json(); // Type assertion for clarity

    if (!response.ok) {
      console.error("Vimeo API error during video creation:", responseData);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: responseData.error || responseData.developer_message || "Failed to create video on Vimeo.",
          vimeoErrorDetails: responseData, // Include full Vimeo error for debugging
        }),
        headers: { "Content-Type": "application/json" },
      };
    }

    if (responseData.upload?.approach !== 'tus') {
      console.error("Vimeo API did not return TUS approach as expected:", responseData);
      return {
        statusCode: 500, // Or 422 Unprocessable Entity if Vimeo gives something unexpected
        body: JSON.stringify({ error: "Vimeo did not confirm TUS upload approach. Received: " + responseData.upload?.approach }),
        headers: { "Content-Type": "application/json" },
      };
    }

    if (!responseData.upload?.upload_link) {
        console.error("Vimeo API response missing upload_link:", responseData);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Vimeo response did not include an upload link." }),
            headers: { "Content-Type": "application/json" },
        };
    }

    // Success: return the TUS upload link and video URI to the client
    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadLink: responseData.upload.upload_link,
        videoUri: responseData.uri,
        videoName: responseData.name, // Return the actual name used
        // You might want to return other useful details from responseData
      }),
      headers: { "Content-Type": "application/json" },
    };

  } catch (error: any) {
    console.error("Exception when calling Vimeo API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error while communicating with Vimeo API.", details: error.message }),
      headers: { "Content-Type": "application/json" },
    };
  }
};

export { handler }; 