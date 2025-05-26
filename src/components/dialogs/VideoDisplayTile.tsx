import React from "react";
import { StarIcon, PlayIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";
import styles from "./ExerciseFeedbackDialog.module.scss";
import { SmartIcon } from "../SmartIcon";
import clsx from "clsx";
import VideoThumbnail from "./VideoThumbnail";
import VideoTimestamp from "./VideoTimestamp";

interface VideoDisplayTileProps {
	videoUrl: string;
	index: number;
	isStarred: boolean;
	onStarClick: (index: number) => void;
	onTileClick: (videoUrl: string) => void;
	videoId?: string;
	videoTimestamp?: Date | string | number;
}

const VideoDisplayTile: React.FC<VideoDisplayTileProps> = ({
	videoUrl,
	index,
	isStarred,
	onStarClick,
	onTileClick,
	videoId,
	videoTimestamp,
}) => {
	const handleStarClickEvent = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.stopPropagation();
		onStarClick(index);
	};

	return (
		<VideoTimestamp timestamp={videoTimestamp}>
			<VideoThumbnail
				aria-label={`Play video ${index + 1}`}
				className={styles.videoTile}
				onClick={() => onTileClick(videoUrl)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onTileClick(videoUrl);
					}
				}}
				role="button"
				tabIndex={0}
				videoId={videoId || ""}
			>
				<SmartIcon
					aria-label={isStarred ? "Unstar video" : "Star video"}
					as={StarIcon}
					className={clsx(
						styles.starIconTile,
						isStarred ? styles.starIconFilled : styles.starIconStroke,
					)}
					filled={isStarred}
					onClick={handleStarClickEvent}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							handleStarClickEvent(e);
						}
					}}
					role="button"
					tabIndex={0}
				/>
				<PlayIcon aria-hidden="true" className={styles.playIconTile} />
				<div className={styles.videoTileLabel}>Video {index + 1}</div>
			</VideoThumbnail>
		</VideoTimestamp>
	);
};

export default VideoDisplayTile;
