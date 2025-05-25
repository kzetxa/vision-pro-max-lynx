import React from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../contexts/StoreContext";
import styles from "./VideoPlayerDialog.module.scss"; // We'll need to create this SCSS file
import { Cross2Icon } from "@radix-ui/react-icons";

export interface VideoPlayerDialogProps {
  vimeoCode: string;
  title?: string; // Optional title for the dialog or video
}

const VideoPlayerDialog: React.FC<VideoPlayerDialogProps> = observer(({ vimeoCode, title }) => {
	const { dialogStore } = useStore();

	if (!vimeoCode) {
		// This case should ideally be prevented by the calling component
		console.error("VideoPlayerDialog: vimeoCode is missing.");
		dialogStore.popDialog(); // Close if no code
		return null;
	}

	return (
		<div className={styles.dialogOverlay} onClick={() => dialogStore.popDialog()}>
			<div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
				<button
					aria-label="Close video player"
					className={styles.closeButton}
					onClick={() => dialogStore.popDialog()}
				>
					<Cross2Icon />
				</button>
				{title && <h3 className={styles.videoTitle}>{title}</h3>}
				<div className={styles.videoWrapper}>
					<iframe
						allow="autoplay; fullscreen; picture-in-picture"
						allowFullScreen
						className={styles.videoFrame}
						frameBorder="0"
						src={`https://player.vimeo.com/video/${vimeoCode}?autoplay=1&muted=0&loop=0&controls=1&title=0&byline=0&portrait=0`}
						title={title || `Vimeo Video ${vimeoCode}`}
					/>
				</div>
			</div>
		</div>
	);
});

export default VideoPlayerDialog; 