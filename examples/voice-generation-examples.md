# Multilingual Voice Generation Examples

This document shows how to use the updated voice generation API to create audio in different languages.

## API Endpoint

The voice generation API is available at: `/api/generate-voice`

## Request Format

```json
{
  "exerciseId": "uuid-of-exercise",
  "text": "Text to convert to speech",
  "language": "es" // Optional - defaults to "en"
}
```

## Examples

### 1. Generate English Voice (Default)

```javascript
const response = await fetch('/api/generate-voice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    exerciseId: '123e4567-e89b-12d3-a456-426614174000',
    text: 'Perform 10 push-ups with proper form.'
  })
});

const result = await response.json();
console.log(result.url); // S3 URL of the generated audio
```

### 2. Generate Spanish Voice

```javascript
const response = await fetch('/api/generate-voice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    exerciseId: '123e4567-e89b-12d3-a456-426614174000',
    text: 'Realiza 10 flexiones con la forma correcta.',
    language: 'es'
  })
});
```

### 3. Generate French Voice

```javascript
const response = await fetch('/api/generate-voice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    exerciseId: '123e4567-e89b-12d3-a456-426614174000',
    text: 'Effectuez 10 pompes avec la bonne forme.',
    language: 'fr'
  })
});
```

### 4. Generate Japanese Voice

```javascript
const response = await fetch('/api/generate-voice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    exerciseId: '123e4567-e89b-12d3-a456-426614174000',
    text: '正しいフォームで10回の腕立て伏せを行います。',
    language: 'ja'
  })
});
```

## Supported Languages

The API supports over 100 languages including:

- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `pl` - Polish
- `hi` - Hindi
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese
- `ru` - Russian
- `ar` - Arabic
- And many more...

## Response Format

```json
{
  "url": "https://your-s3-bucket.s3.us-west-2.amazonaws.com/audio-file.mp3"
}
```

## Caching Behavior

- The API checks if a voice file already exists for the given exercise and language
- If a matching voice file exists, it returns the existing URL
- If no matching voice file exists, it generates a new one and stores it
- Each language version is stored separately, so you can have multiple language versions for the same exercise

## Error Handling

```javascript
try {
  const response = await fetch('/api/generate-voice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exerciseId: 'invalid-id',
      text: 'Test text',
      language: 'en'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Voice generation failed:', error);
    return;
  }

  const result = await response.json();
  console.log('Success:', result.url);
} catch (error) {
  console.error('Request failed:', error);
}
```

## Integration with Frontend

You can integrate this with your React components:

```jsx
import { useState } from 'react';

function ExerciseVoiceGenerator({ exerciseId, text }) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  const generateVoice = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId,
          text,
          language
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAudioUrl(result.url);
      }
    } catch (error) {
      console.error('Failed to generate voice:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="ja">Japanese</option>
      </select>
      
      <button onClick={generateVoice} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Voice'}
      </button>
      
      {audioUrl && (
        <audio controls>
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
``` 