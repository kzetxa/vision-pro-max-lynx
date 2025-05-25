import axios from "axios";

// Function to convert text to speech using ElevenLabs API
async function textToSpeech(text) {
	try {
		const response = await axios({
			method: "POST",
			url: "https://api.elevenlabs.io/v1/text-to-speech/EiNlNiXeDU1pqqOPrYMO",
			headers: {
				Accept: "audio/mpeg",
				"Content-Type": "application/json",
				"xi-api-key": process.env.ELEVENLABS_API_KEY,
			},
			data: {
				text: text,
				model_id: "eleven_monolingual_v1",
				voice_settings: {
					stability: 0.5,
					similarity_boost: 0.5,
				},
			},
			responseType: "arraybuffer",
		});

		return response.data;
	} catch (error) {
		console.error("Error converting text to speech:", error);
		throw error;
	}
}

// Example usage
async function main() {
	try {
		const longText = "This is a long text string that will be converted to speech. You can replace this with your actual text content.";
		const audioBuffer = await textToSpeech(longText);
		
		// You can save the audio buffer to a file
		const fs = require("fs");
		fs.writeFileSync("output.mp3", audioBuffer);
		console.log("Audio generated successfully");
	} catch (error) {
		console.error("Failed to generate audio:", error);
	}
}

main();

