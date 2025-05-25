import React from "react";
import styles from "./FileUpload.module.scss";
import { PlusIcon } from "@radix-ui/react-icons"; // Or any other plus icon source

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  // Add other props like accepted file types, size limits, etc., as needed
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			onFileSelect(file);
		}
	};

	return (
		<div className={styles.uploadContainer}>
			<input 
				accept="video/*" // Example: accept video files 
				className={styles.fileInput}
				id="file-upload-input"
				onChange={handleFileChange}
				type="file"
			/>
			<label className={styles.uploadLabel} htmlFor="file-upload-input">
				<PlusIcon className={styles.plusIcon} />
			</label>
		</div>
	);
};

export default FileUpload; 