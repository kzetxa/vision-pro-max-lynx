import React from "react";
import styles from "./VideoTimestamp.module.scss";

interface VideoTimestampProps {
  timestamp?: Date | string | number; // Accept various timestamp formats
  children: React.ReactNode;
}

const VideoTimestamp: React.FC<VideoTimestampProps> = ({ timestamp, children }) => {
	const formatDate = (dateInput: Date | string | number | undefined): string | null => {
		if (!dateInput) return null;
		try {
			const date = new Date(dateInput);
			return date.toLocaleDateString("en-US", {
				month: "short",
				day: "2-digit",
				year: "numeric",
			});
		} catch (error) {
			console.error("Error formatting timestamp:", error);
			return "Invalid Date";
		}
	};

	const formattedDate = formatDate(timestamp);

	return (
		<div className={styles.videoTimestampContainer}>
			{children}
			{formattedDate && (
				<div className={styles.timestampOverlay}>
					{formattedDate}
				</div>
			)}
		</div>
	);
};

export default VideoTimestamp; 