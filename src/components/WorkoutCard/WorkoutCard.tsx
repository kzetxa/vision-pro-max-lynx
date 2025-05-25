import React from "react";
import { Link } from "react-router-dom";
// import type { WorkoutWithBlock1Preview } from '../lib/types'; // Old Type
import type { SupabaseWorkoutPreview } from "../../lib/types"; // New Type
import { extractUrlFromStringArray } from "../../lib/utils"; // Import the new utility function
import styles from "./WorkoutCard.module.scss"; // Import the SCSS module

interface WorkoutCardProps {
  // workout: WorkoutWithBlock1Preview; // Old prop
  workoutPreview: SupabaseWorkoutPreview; // New prop
}

// Basic placeholder image if header_image_url is missing
const PLACEHOLDER_IMAGE_URL = "https://via.placeholder.com/300x200.png?text=Workout"; 

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workoutPreview }) => {
	// Extract data using Supabase field names
	const workoutId = workoutPreview.id;
	// Use workout title, fallback to block 1 name if needed (logic might change based on preference)
	const title = workoutPreview.public_workout_title || workoutPreview.block1_public_name || "Unnamed Workout";
  
	// Use the utility function to extract the URL
	const extractedImageUrl = extractUrlFromStringArray(workoutPreview.header_image_url);
	const imageUrl = extractedImageUrl || PLACEHOLDER_IMAGE_URL;
  
	const focus = workoutPreview.focus_area;
	const level = workoutPreview.level;
	const duration = workoutPreview.duration;

	return (
		<Link className={styles.cardLink} to={`/workout/${workoutId}`}>
			<div className={styles.card}>
				<img 
					alt={title}
					className={styles.image} 
					src={imageUrl}
				/>
				<div className={styles.content}>
					<h3 className={styles.title}>
						{title}
					</h3>
					<div className={styles.details}>
						{focus && <div>Focus: {focus}</div>}
						{level && <div>Level: {level}</div>}
						{duration && <div>Duration: {duration}</div>}
					</div>
				</div>
			</div>
		</Link>
	);
};

export default WorkoutCard; 