import React from "react";
import FileUpload from "../FileUpload/FileUpload";
import { VimeoUploadResponse } from "../../lib/vimeoUtils";

interface VideoUploadTileProps {
  onUploadComplete: (result: VimeoUploadResponse) => void;
}

const VideoUploadTile: React.FC<VideoUploadTileProps> = ({ onUploadComplete }) => {
	return (
		<div style={{ position: "relative" }}>
			<FileUpload onUploadComplete={onUploadComplete} />
		</div>
	);
};

export default VideoUploadTile; 