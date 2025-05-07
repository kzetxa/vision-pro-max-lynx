import React, { useState } from 'react';
import type { Exercise } from '../lib/types'; // Exercise is AirtableRecord<ExerciseFields>
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as RadixTabs from '@radix-ui/react-tabs';
import { CheckIcon } from '@radix-ui/react-icons';
// import * as Checkbox from '@radix-ui/react-checkbox'; // Will add later
// import { CheckIcon } from '@radix-ui/react-icons'; // Will add later for checkbox

interface ExerciseTileProps {
  exercise: Exercise;
  // onCompletionChange?: (exerciseId: string, setId: string | number, completed: boolean) => void; // For later with Supabase
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

const ExerciseTile: React.FC<ExerciseTileProps> = ({ exercise }) => {
  const { fields } = exercise;
  const exerciseName = fields["Current Name"] || 'Unnamed Exercise';
  
  // Safely handle Primary Muscle Worked whether it's an array, string, or undefined
  const muscleData = fields["Primary Muscle Worked"];
  const muscleWorked = Array.isArray(muscleData)
    ? muscleData.join(', ') 
    : (typeof muscleData === 'string' ? muscleData : 'N/A');

  const vimeoCode = fields["Vimeo Code"];
  const explanation1 = fields["Explination 1"];

  // Placeholder for set completion state, will eventually come from/go to Supabase
  // For simplicity, let's assume 3 sets for now if not specified by exercise data.
  const [setsCompleted, setSetsCompleted] = useState<boolean[]>([false, false, false]);
  const [activeTab, setActiveTab] = useState(vimeoCode ? 'video' : (explanation1 ? 'details' : ''));

  const handleSetCompletion = (index: number) => {
    const newSetsCompleted = [...setsCompleted];
    newSetsCompleted[index] = !newSetsCompleted[index];
    setSetsCompleted(newSetsCompleted);
    // TODO: Call onCompletionChange here to update Supabase
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
      <p style={{ fontSize: '0.9em', margin: '0 0 15px 0', color: 'var(--text-secondary)' }}>Muscle: {muscleWorked}</p>
      
      {(vimeoCode || explanation1) && (
        <RadixTabs.Root defaultValue={activeTab} onValueChange={setActiveTab} style={{ width: '100%' }}>
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
            </RadixTabs.Content>
          )}
        </RadixTabs.Root>
      )}
      {!(vimeoCode || explanation1) && (
          <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0'}}>No video or details available.</p>
      )}

      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: `1px solid ${ (vimeoCode || explanation1) ? 'var(--glass-border-color)' : 'transparent'}` }}>
        <p style={{fontSize: '0.95em', marginBottom: '10px', fontWeight: 500, color: 'var(--text-headings)'}}>Track Sets:</p>
        {setsCompleted.map((isCompleted, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <RadixCheckbox.Root
              id={`set-${exercise.id}-${index}`}
              checked={isCompleted}
              onCheckedChange={() => handleSetCompletion(index)}
              style={{
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
            <label htmlFor={`set-${exercise.id}-${index}`} style={{ fontSize: '0.9em', cursor: 'pointer', color: 'var(--text-primary)' }}>
              Set {index + 1}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseTile; 