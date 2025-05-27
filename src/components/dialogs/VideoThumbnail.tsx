import React, { useEffect, useMemo, HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import { VideoThumbnailStore, ThumbnailStatus } from "../../stores/VideoThumbnailStore"; // Import the new store

interface VimeoThumbnailProps extends HTMLAttributes<HTMLDivElement> {
	videoId: string;
	children?: React.ReactNode;
}

// Placeholder style for when thumbnail is processing or unavailable
const placeholderStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	backgroundColor: "#4A4A4A", // Darker placeholder background
	color: "#ccc",
	fontSize: "0.9em",
	textAlign: "center",
	// Ensure these are a good default for your tiles
	minHeight: 120, // Match typical thumbnail height
	minWidth: 200,  // Match typical thumbnail width
};

const VimeoThumbnail: React.FC<VimeoThumbnailProps> = observer(({ videoId, children, style, ...rest }) => {
	// Instantiate the store. One store instance per thumbnail component.
	const store = useMemo(() => new VideoThumbnailStore(), []);

	// Update the store when the videoId prop changes
	useEffect(() => {
		store.setVideoId(videoId);

		// Cleanup function to dispose the store's reaction when the component unmounts
		return () => {
			store.dispose();
		};
	}, [videoId, store]);

	const { thumbnailUrl, status, errorMessage } = store;

	const combinedStyle: React.CSSProperties = {
		...style, // User-provided styles take precedence for things like width/height if passed
		backgroundImage: thumbnailUrl && status === "loaded" ? `url(${thumbnailUrl})` : undefined,
		backgroundSize: "cover",
		backgroundPosition: "center",
		// Apply placeholder styles if not loaded or if base style doesn't cover these
		width: style?.width || placeholderStyle.minWidth,
		height: style?.height || placeholderStyle.minHeight,
		display: style?.display || placeholderStyle.display,
		alignItems: style?.alignItems || placeholderStyle.alignItems,
		justifyContent: style?.justifyContent || placeholderStyle.justifyContent,
		backgroundColor: thumbnailUrl && status === "loaded" ? style?.backgroundColor : placeholderStyle.backgroundColor,
		color: thumbnailUrl && status === "loaded" ? style?.color : placeholderStyle.color,
		fontSize: style?.fontSize || placeholderStyle.fontSize,
	};

	let content: React.ReactNode = children; // Default to showing children (e.g., play icon)

	switch (status) {
		case "loading":
		case "idle": // Show loading for idle too, as fetch will be triggered by reaction
			content = <>Loading... {children}</>; // Keep children visible during load
			break;
		case "processing":
			content = <>Video processing... {children}</>;
			break;
		case "error":
			content = <>{errorMessage || "Thumbnail unavailable"} {children}</>;
			break;
		case "loaded":
			// Background image is set by combinedStyle, children are overlaid
			break;
	}

	return (
		<div style={combinedStyle} {...rest}>
			{content}
		</div>
	);
});

export default VimeoThumbnail;
