import React, { useEffect, useState, HTMLAttributes } from "react";

interface VimeoThumbnailProps extends HTMLAttributes<HTMLDivElement> {
	videoId: string;
	children?: React.ReactNode;
}

const VimeoThumbnail: React.FC<VimeoThumbnailProps> = ({ videoId, children, style, ...rest }) => {
	const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!videoId) {
			setError("Video ID is required.");
			setIsLoading(false);
			return;
		}
		const fetchThumbnail = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const res = await fetch(
					`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`,
				);
				if (!res.ok) {
					throw new Error(`Failed to fetch thumbnail data (status: ${res.status})`);
				}
				const data = await res.json();
				if (data && data.thumbnail_url) {
					setThumbnailUrl(data.thumbnail_url);
				} else {
					throw new Error("Thumbnail URL not found in Vimeo response");
				}
			} catch (fetchError: any) {
				console.error("Error fetching Vimeo thumbnail:", fetchError);
				setError(fetchError.message || "Could not load thumbnail.");
				setThumbnailUrl(null); // Ensure no stale thumbnail on error
			}
			setIsLoading(false);
		};

		fetchThumbnail();
	}, [videoId]);

	const divStyle: React.CSSProperties = {
		...style,
		backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : undefined,
		backgroundSize: "cover",
		backgroundPosition: "center",
		// Ensure a default appearance if the image is loading or fails
		width: style?.width || 200, // Default width if not provided via style prop
		height: style?.height || 120, // Default height if not provided via style prop
		display: style?.display || "flex",
		alignItems: style?.alignItems || "center",
		justifyContent: style?.justifyContent || "center",
		backgroundColor: thumbnailUrl ? undefined : (style?.backgroundColor || "#333"), // Placeholder color
	};

	if (isLoading) {
		// You can return a more sophisticated loading placeholder here if needed
		return <div style={divStyle}>Loading thumbnail...</div>;
	}

	if (error && !thumbnailUrl) {
		// Display error state or a fallback UI if thumbnail fails but children should still render
		// For now, just show error, but you might want children to still show with a placeholder background
		return <div style={divStyle}>Error: {error} {children}</div>;
	}

	return (
		<div style={divStyle} {...rest}>
			{children}
		</div>
	);
};

export default VimeoThumbnail;
