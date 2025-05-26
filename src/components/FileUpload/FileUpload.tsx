import React, { useState } from "react";
import styles from "./FileUpload.module.scss";
import { PlusIcon } from "@radix-ui/react-icons"; // Or any other plus icon source
import { uploadVideoToVimeo, VimeoUploadResponse } from "../../lib/vimeoUtils"; // Adjust path and import VimeoUploadResponse

interface FileUploadProps {
  // Optional: Callback for when upload is fully complete, returning video ID or error
  onUploadComplete?: (result: VimeoUploadResponse) => void; // Use VimeoUploadResponse type
  // You can add more specific callbacks for different stages if needed
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [uploadStatus, setUploadStatus] = useState("");

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		setUploadProgress(0);
		setUploadStatus(`Starting upload for ${file.name}...`);

		const result = await uploadVideoToVimeo({
			file,
			videoName: file.name,
			onProgress: (progress) => {
				setUploadProgress(progress);
				setUploadStatus(`Uploading: ${progress}%`);
			},
		});

		setIsUploading(false);
		if (result.success) {
			setUploadStatus("Upload successful!");
			onUploadComplete?.(result);
		} else {
			setUploadStatus(`Upload failed: ${result.error}`);
			onUploadComplete?.({ success: false, error: result.error });
		}
		event.target.value = ""; // Reset file input
	};

	return (
		<div className={styles.uploadContainer}>
			<input
				accept="video/*"
				className={styles.fileInput}
				disabled={isUploading}
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