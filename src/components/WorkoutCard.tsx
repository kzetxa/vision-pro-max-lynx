import React from 'react';
import type { WorkoutWithBlock1Preview, AirtableAttachment } from '../lib/types';
import { Link } from 'react-router-dom';

interface WorkoutCardProps {
  workout: WorkoutWithBlock1Preview;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout }) => {
  const { Name, "Type of workout": typeOfWorkout, resolvedBlock1Preview } = workout.fields;

  const displayName = Name || 'Unnamed Workout';
  const imageAttachment = resolvedBlock1Preview?.["card for preview"]?.[0] as AirtableAttachment | undefined;

  return (
    <div 
      className="glassmorphic"
      style={{
        margin: '15px',
        padding: '20px',
        width: 'calc(100% - 30px)', // Responsive width
        maxWidth: '320px',       // Max width for larger screens
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        textAlign: 'left' // Ensure text aligns left
      }}
    >
      <div> {/* Content wrapper for spacing */} 
        <h3 style={{ marginTop: 0, marginBottom: '12px', minHeight: '2.6em' /* Approx 2 lines */, fontSize: '1.2em', lineHeight: '1.3' }}>{displayName}</h3>
        
        {imageAttachment?.url ? (
          <img 
            src={imageAttachment.thumbnails?.large?.url || imageAttachment.url} 
            alt={imageAttachment.filename || displayName}
            style={{ 
              width: '100%', 
              height: '180px', 
              objectFit: 'cover', 
              borderRadius: 'calc(var(--glass-border-radius) - 4px)', // Slightly smaller radius than card
              marginBottom: '15px',
              border: '1px solid rgba(255,255,255,0.05)' // Subtle border for image
            }}
          />
        ) : (
          <div style={{ 
            width: '100%', 
            height: '180px', 
            backgroundColor: 'rgba(255,255,255,0.08)', 
            marginBottom: '15px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: 'calc(var(--glass-border-radius) - 4px)', 
            color: 'var(--text-secondary)'
          }}>
            <p>No Preview Image</p>
          </div>
        )}

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