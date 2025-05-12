import React from 'react';
import { Link } from 'react-router-dom';
// import type { WorkoutWithBlock1Preview } from '../lib/types'; // Old Type
import type { SupabaseWorkoutPreview } from '../lib/types'; // New Type
import { extractUrlFromStringArray } from '../lib/utils'; // Import the new utility function

interface WorkoutCardProps {
  // workout: WorkoutWithBlock1Preview; // Old prop
  workoutPreview: SupabaseWorkoutPreview; // New prop
}

// Basic placeholder image if header_image_url is missing
const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/300x200.png?text=Workout'; 

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workoutPreview }) => {
  // Extract data using Supabase field names
  const workoutId = workoutPreview.id;
  // Use workout title, fallback to block 1 name if needed (logic might change based on preference)
  const title = workoutPreview.public_workout_title || workoutPreview.block1_public_name || 'Unnamed Workout';
  
  // Use the utility function to extract the URL
  const extractedImageUrl = extractUrlFromStringArray(workoutPreview.header_image_url);
  const imageUrl = extractedImageUrl || PLACEHOLDER_IMAGE_URL;
  
  const focus = workoutPreview.focus_area;
  const level = workoutPreview.level;
  const duration = workoutPreview.duration;

  return (
    <Link to={`/workout/${workoutId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="glassmorphic" style={{
        padding: '0', // Remove padding from container, apply to content areas
        overflow: 'hidden', // Ensure image corners are clipped by border-radius
        height: '100%', // Make card fill grid cell height
        display: 'flex',
        flexDirection: 'column'
      }}>
        <img 
          src={imageUrl}
          alt={title} 
          style={{ 
            width: '100%', 
            height: '180px', // Fixed height for consistency 
            objectFit: 'cover', // Crop image nicely
            display: 'block' 
          }} 
        />
        <div style={{ padding: '1rem'}}> {/* Add padding to content area */}
          <h3 style={{
             marginTop: '0.5rem', 
             marginBottom: '0.75rem', 
             fontSize: '1.2em', 
             color: 'var(--text-headings)',
             // Truncate long titles
             whiteSpace: 'nowrap',
             overflow: 'hidden',
             textOverflow: 'ellipsis'
          }}>
             {title}
          </h3>
          {/* Display other info if available */}
          <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
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