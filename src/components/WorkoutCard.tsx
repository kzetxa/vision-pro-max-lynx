import React from 'react';
import type { Workout } from '../lib/types';
import { Link } from 'react-router-dom';

interface WorkoutCardProps {
  workout: Workout;
}

// Helper function now expects an array of strings and returns an array of URLs
function extractVumbnailUrls(htmlStrings?: string[]): string[] {
  if (!htmlStrings || htmlStrings.length === 0) return [];
  
  const htmlString = htmlStrings[0];
  if (!htmlString) return [];

  // Regex with global flag 'g' to find all matches
  // Looking for src attributes containing vumbnail.com URLs
  const regex = new RegExp("src=[\'\"](https?:\\/\\/.*?vumbnail\.com[^\"\']*)[\'\"]", 'gi');
  const urls: string[] = [];
  let match;

  // Loop through all matches found in the string
  while ((match = regex.exec(htmlString)) !== null) {
    // match[1] contains the captured URL (the first capturing group)
    if (match[1]) {
      urls.push(match[1]);
    }
  }
  
  return urls;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout }) => {
  const { Name, "Type of workout": typeOfWorkout } = workout.fields;
  const previewHtmlArray = workout.fields["card for preview with block (from Block 1)"];

  const displayName = Name || 'Unnamed Workout';
  const imageUrls = extractVumbnailUrls(previewHtmlArray);

  return (
    <div 
      className="glassmorphic"
      style={{
        margin: '15px',
        padding: '20px',
        width: 'calc(100% - 30px)',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left'
      }}
    >
      <div> {/* Content wrapper */} 
        <h3 style={{ marginTop: 0, marginBottom: '12px', minHeight: '2.6em', fontSize: '1.2em', lineHeight: '1.3' }}>{displayName}</h3>
        
        {/* Image Scroll Container */} 
        <div style={{ 
             width: '100%', 
             overflowX: 'auto', 
             display: 'flex', 
             gap: '10px', 
             paddingBottom: '10px', /* Space for scrollbar if visible */
             marginBottom: '15px' 
           }}>
          {imageUrls.length > 0 ? (
            imageUrls.map((url, index) => (
              <img 
                key={index}
                src={url} 
                alt={`${displayName} preview ${index + 1}`}
                style={{ 
                  height: '120px', // Smaller height for multiple images
                  minWidth: '150px', // Ensure images have some width
                  objectFit: 'cover', 
                  borderRadius: 'calc(var(--glass-border-radius) - 6px)', // Slightly more rounded inner elements
                  border: '1px solid rgba(255,255,255,0.05)',
                  flexShrink: 0 // Prevent images from shrinking
                }}
              />
            ))
          ) : (
            /* Placeholder if no images found */
            <div style={{ 
              width: '100%', 
              height: '120px', // Match potential image height 
              backgroundColor: 'rgba(255,255,255,0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRadius: 'calc(var(--glass-border-radius) - 4px)', 
              color: 'var(--text-secondary)'
            }}>
              <p>No Preview Image</p>
            </div>
          )}
        </div>

        {typeOfWorkout && <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '20px' }}>Type: {typeOfWorkout}</p>}
      </div>
      
      <Link 
        to={`/workout/${workout.id}?clientid=abc123`} 
        style={{
          display: 'block', // Make it block for full width within its space
          padding: '10px 15px',
          backgroundColor: 'var(--accent-color)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: 'calc(var(--glass-border-radius) - 6px)',
          textAlign: 'center',
          fontWeight: 500,
          marginTop: 'auto', // Push to bottom if card content is short
          transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-color-hover)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-color)';
          e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        }}
      >
        View Workout
      </Link>
    </div>
  );
};

export default WorkoutCard; 