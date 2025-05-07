import React from 'react';
import ExerciseTile from './ExerciseTile';
import type { PopulatedBlock } from '../lib/types';

interface BlockViewerProps {
  block: PopulatedBlock;
}

const BlockViewer: React.FC<BlockViewerProps> = ({ block }) => {
  const { fields } = block;
  const blockName = fields["Public Name"] || fields["Block Name"] || 'Unnamed Block';
  const setsAndReps = fields["Sets & Reps"] || 'N/A';
  const equipment = fields.Equipment?.join(', ') || 'N/A';
  const exercises = fields.resolvedExercises || [];

  return (
    <div 
      className="glassmorphic"
      style={{
        marginBottom: '25px',
        padding: '20px 25px',
        border: '1px solid var(--glass-border-color)'
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: '10px', color: 'var(--text-headings)', fontSize: '1.3em' }}>{blockName}</h4>
      <p style={{ fontSize: '0.95em', color: 'var(--text-secondary)', marginBottom: '5px' }}><strong>Sets & Reps:</strong> {setsAndReps}</p>
      <p style={{ fontSize: '0.95em', color: 'var(--text-secondary)', marginBottom: '20px' }}><strong>Equipment:</strong> {equipment}</p>
      
      {exercises.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <h5 style={{ marginBottom: '10px', color: 'var(--text-headings)', fontSize: '1.1em' }}>Exercises:</h5>
          {exercises.map(exercise => (
            <ExerciseTile key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
      {exercises.length === 0 && <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0'}}>No exercises listed for this block.</p>}
    </div>
  );
};

export default BlockViewer; 