import React from "react";
import { observer } from "mobx-react-lite";
import type { SupabasePopulatedWorkout } from "../../lib/types"; // Adjust path as needed
import { extractUrlFromStringArray } from "../../lib/utils"; // Adjust path as needed
import Badge from "../Badge/Badge"; // Assuming Badge is in src/components/Badge.tsx
import styles from "../../pages/WorkoutPage.module.scss"; // Use existing styles for now

interface WorkoutHeaderProps {
	workoutData: SupabasePopulatedWorkout;
	// clientId?: string; // If needed in the future
}

const WorkoutHeader: React.FC<WorkoutHeaderProps> = observer(({ workoutData }) => {
	const workoutTitle = workoutData.public_workout_title || "Workout Plan";
	const headerImageUrl = extractUrlFromStringArray(workoutData.header_image_url);

	return (
		<>
			{headerImageUrl ? (
				<img 
					alt={workoutTitle} 
					className={styles.workoutHeaderImage} 
					src={headerImageUrl} 
				/>
			) : (
				<div className={styles.workoutImagePlaceholder}>
					<span>Image Placeholder</span> 
				</div>
			)}
			{/* <h2 className={styles.title}>{workoutTitle}</h2> */} {/* Original title was commented out */}
			<span style={{ display: "flex", gap: "1rem", marginTop: "1rem", marginBottom: "1rem" }}>
				<Badge label="Level:" value={workoutData.level} />
				<Badge label="Duration:" value={workoutData.duration} />
			</span>
			{/* If clientId display is needed here: */}
			{/* {clientId && <p className={styles.clientId}>Client ID: {clientId}</p>} */}
		</>
	);
});

export default WorkoutHeader; 