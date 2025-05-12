import React, { useState } from 'react';
// import type { Exercise } from '../lib/types'; // Old Airtable Type
import type { SupabaseBlockExercise, SupabaseExercise } from '../lib/types'; // New Supabase Type
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as RadixTabs from '@radix-ui/react-tabs';
import { CheckIcon } from '@radix-ui/react-icons';
// import * as Checkbox from '@radix-ui/react-checkbox'; // Will add later
// import { CheckIcon } from '@radix-ui/react-icons'; // Will add later for checkbox

interface ExerciseTileProps {
  // exercise: Exercise; // Old Airtable Type
  blockExercise: SupabaseBlockExercise; // New Supabase Type
  // onCompletionChange?: (exerciseId: string, setId: string | number, completed: boolean) => void; // Will need update for Supabase IDs
}

const getTabTriggerStyle = (isActive?: boolean): React.CSSProperties => ({
  all: 'unset',
  fontFamily: 'inherit',
  backgroundColor: 'transparent',
  padding: '0 15px',
  height: '40px', // Slightly taller tabs
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: isActive ? 'var(--text-headings)' : 'var(--text-secondary)',
  fontSize: '0.9em',
  lineHeight: 1,
  cursor: 'pointer',
  borderBottom: `2px solid ${isActive ? 'var(--accent-color)' : 'transparent'}`,
  transition: 'color 0.2s ease-out, border-color 0.2s ease-out',
  marginRight: '10px',
});

const ExerciseTile: React.FC<ExerciseTileProps> = ({ blockExercise }) => {
  // Extract exercise details from the nested exercise object
  const exercise: SupabaseExercise | null = blockExercise.exercise; 

  if (!exercise) {
    // Handle case where exercise data might be missing (though unlikely with the current query)
    return (
        <div style={{
          border: '1px solid var(--glass-border-color)',
          backgroundColor: 'var(--card-bg-darker)', 
          padding: '20px',
          margin: '15px 0',
          borderRadius: 'var(--glass-border-radius)',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
            Exercise details not available for this entry (ID: {blockExercise.id}).
        </div>
    );
  }

  // Use Supabase field names from the exercise object
  const exerciseName = exercise.current_name || 'Unnamed Exercise';
  const muscleWorked = exercise.equipment_public_name || 'N/A'; // Assuming this is the primary muscle field now?
  const vimeoCode = exercise.vimeo_code;
  // Use Supabase explanation fields
  const explanation1 = exercise.explanation_1;
  
  // Get sets/reps from blockExercise (individual block data)
  const setCount = blockExercise.sets ?? 3; // Default to 3 sets if not specified
  const setsRepsText = blockExercise.sets_and_reps_text;
  const unit = blockExercise.unit;
  const specialInstructions = blockExercise.special_instructions;

  // State for checkboxes based on actual set count
  const [setsCompleted, setSetsCompleted] = useState<boolean[]>(Array(setCount).fill(false));
  const [activeTab, setActiveTab] = useState(vimeoCode ? 'video' : (explanation1 ? 'details' : ''));

  const handleSetCompletion = (index: number) => {
    const newSetsCompleted = [...setsCompleted];
    newSetsCompleted[index] = !newSetsCompleted[index];
    setSetsCompleted(newSetsCompleted);
    // TODO: Call onCompletionChange here to update Supabase
    // Need Supabase IDs: blockExercise.id (individual block instance), exercise.id (exercise library entry)
    // console.log(`Exercise ${exercise.id}, Set ${index + 1} completion: ${newSetsCompleted[index]}`);
  };

  return (
    <div style={{
      border: '1px solid var(--glass-border-color)',
      backgroundColor: 'var(--card-bg-darker)', 
      padding: '20px',
      margin: '15px 0',
      borderRadius: 'var(--glass-border-radius)'
    }}>
      <h5 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.15em', color: 'var(--text-headings)' }}>{exerciseName}</h5>
      {/* Display Sets/Reps/Unit/Instructions if available */}
      <div style={{ fontSize: '0.9em', margin: '0 0 15px 0', color: 'var(--text-secondary)' }}>
          {setsRepsText && <div>Sets/Reps: {setsRepsText}</div>}
          {unit && <div>Unit: {unit}</div>}
          {muscleWorked !== 'N/A' && <div>Muscle: {muscleWorked}</div>}
          {specialInstructions && <div style={{marginTop: '5px'}}>Notes: {specialInstructions}</div>}
      </div>
      
      {(vimeoCode || explanation1) && (
        <RadixTabs.Root defaultValue={activeTab} onValueChange={setActiveTab} style={{ width: '100%' }}>
           {/* Tabs List and Content - use vimeoCode and explanation1 */}
          <RadixTabs.List style={{ display: 'flex', borderBottom: '1px solid var(--glass-border-color)', marginBottom: '15px' }}>
            {vimeoCode && (
              <RadixTabs.Trigger value="video" style={getTabTriggerStyle(activeTab === 'video')}>
                Video
              </RadixTabs.Trigger>
            )}
            {explanation1 && (
              <RadixTabs.Trigger value="details" style={getTabTriggerStyle(activeTab === 'details')}>
                Details
              </RadixTabs.Trigger>
            )}
          </RadixTabs.List>

          {vimeoCode && (
            <RadixTabs.Content value="video">
              <div style={{ margin: '10px 0', aspectRatio: '16/9', overflow: 'hidden', borderRadius: 'calc(var(--glass-border-radius) - 4px)' }}>
                <iframe 
                  src={`https://player.vimeo.com/video/${vimeoCode}`}
                  width="100%" 
                  height="100%" // Fill the aspect ratio container
                  frameBorder="0" 
                  allow="autoplay; fullscreen; picture-in-picture" 
                  allowFullScreen
                  title={exerciseName}
                  style={{display: 'block'}}
                ></iframe>
              </div>
            </RadixTabs.Content>
          )}
          {explanation1 && (
            <RadixTabs.Content value="details">
              <p style={{ fontSize: '0.95em', lineHeight: 1.65, color: 'var(--text-primary)', padding: '5px 0' }}>{explanation1}</p>
              {/* Consider adding explanation_2, 3, 4 if needed */}
            </RadixTabs.Content>
          )}
        </RadixTabs.Root>
      )}
      {!(vimeoCode || explanation1) && (
          <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0'}}>No video or details available.</p>
      )}

      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${ (vimeoCode || explanation1) ? 'var(--glass-border-color)' : 'transparent'}` }}>
        <p style={{fontSize: '0.95em', marginBottom: '10px', fontWeight: 500, color: 'var(--text-headings)'}}>Track Sets ({setCount}):</p>
        {/* Map over the actual number of sets */}
        {setsCompleted.map((isCompleted, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <RadixCheckbox.Root
              // Use Supabase IDs in the element ID for uniqueness
              id={`set-${blockExercise.id}-${index}`}
              checked={isCompleted}
              onCheckedChange={() => handleSetCompletion(index)}
              style={{ /* Styles remain the same */ 
                all: 'unset',
                backgroundColor: isCompleted ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)',
                width: '22px',
                height: '22px',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 1px 3px rgba(0,0,0,0.2)`,
                cursor: 'pointer',
                marginRight: '10px',
                border: isCompleted ? 'none' : '1px solid rgba(255,255,255,0.25)',
                transition: 'background-color 0.1s ease-out'
              }}
            >
              <RadixCheckbox.Indicator style={{ color: 'white' }}>
                <CheckIcon width={18} height={18} />
              </RadixCheckbox.Indicator>
            </RadixCheckbox.Root>
            <label htmlFor={`set-${blockExercise.id}-${index}`} style={{ fontSize: '0.9em', cursor: 'pointer', color: 'var(--text-primary)' }}>
              Set {index + 1}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseTile; 