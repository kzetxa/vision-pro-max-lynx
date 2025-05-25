import React, { useState } from "react";
import styles from "./FileUpload.module.scss";
import { PlusIcon } from "@radix-ui/react-icons"; // Or any other plus icon source
import { uploadVideoToVimeo } from "../../lib/vimeoUtils"; // Adjust path if necessary

interface FileUploadProps {
  // Optional: Callback for when upload is fully complete, returning video ID or error
  onUploadComplete?: (result: { videoId?: string; error?: string }) => void;
  // You can add more specific callbacks for different stages if needed
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadStatus, setUploadStatus] = useState(""); // For messages like "Uploading...", "Success!", "Error!"

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		setIsUploading(true);
		setUploadProgress(0);
		setUploadStatus(`Starting upload for ${file.name}...`);

		const result = await uploadVideoToVimeo({
			file: file,
			videoName: file.name, // You could allow user to set this via another input
			// videoDescription: "My awesome video", // Optional description
			onProgress: (progress) => {
				setUploadProgress(progress);
				setUploadStatus(`Uploading: ${progress}%`);
			},
		});

		setIsUploading(false);
		if (result.success) {
			setUploadStatus(`Upload successful! Video ID: ${result.videoId}`);
			onUploadComplete?.({ videoId: result.videoId });
		} else {
			setUploadStatus(`Upload failed: ${result.error}`);
			onUploadComplete?.({ error: result.error });
		}
		// Reset file input to allow uploading the same file again if needed
		event.target.value = ""; 
	};

	return (
		<div className={styles.uploadContainer}>
			<input 
				accept="video/*" 
				className={styles.fileInput}
				disabled={isUploading} // Disable input while uploading
				id="file-upload-input"
				onChange={handleFileChange}
				type="file"
			/>
			<label 
				className={`${styles.uploadLabel} ${isUploading ? styles.disabledLabel : ""}`} 
				htmlFor="file-upload-input"
			>
				{isUploading ? (
					<div className={styles.progressDisplay}>
						<div>{uploadStatus}</div>
						{/* Basic progress bar - can be made more sophisticated */} 
						<div style={{ width: "100%", backgroundColor: "#555", borderRadius: "4px", marginTop: "5px" }}>
							<div 
								style={{
									width: `${uploadProgress}%`,
									height: "10px",
									backgroundColor: "#4CAF50",
									borderRadius: "4px",
									transition: "width 0.3s ease-in-out",
								}}
							/>
						</div>
					</div>
				) : (
					<PlusIcon className={styles.plusIcon} />
				)}
			</label>
		</div>
	);
};

export default FileUpload; 