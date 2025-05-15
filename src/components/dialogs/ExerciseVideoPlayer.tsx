import React from "react";
import styles from "./ExerciseDetailDialog.module.scss"; // Assuming styles might be shared or specific

interface ExerciseVideoPlayerProps {
  vimeoCode?: string | null;
  exerciseName: string;
}

const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = ({
	vimeoCode,
	exerciseName,
}) => {
	return (
		<div className={styles.videoPanel}>
			{vimeoCode ? (
				<iframe
					allow="autoplay; fullscreen; picture-in-picture"
					allowFullScreen
					className={styles.videoFrame}
					frameBorder="0"
					src={`https://player.vimeo.com/video/${vimeoCode}?autoplay=1&muted=1&loop=1&autopause=0&controls=0&title=0&byline=0&portrait=0`}
					title={exerciseName}
				/>
			) : (
				<div className={styles.videoPlaceholder}>No Video Available</div>
			)}
		</div>
	);
};

export default ExerciseVideoPlayer; 