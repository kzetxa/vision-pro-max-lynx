# Translation System Examples

This document shows how the translation system works with the voice generation feature.

## How It Works

1. **User selects a language** from the LanguageSelector dropdown
2. **When audio is needed**, the system checks if the selected language is English
3. **If not English**, the text is translated using OpenAI API before being sent to voice generation
4. **Voice generation** uses the translated text with the appropriate ElevenLabs model

## API Endpoint

The translation API is available at: `/api/translate-text`

## Request Format

```json
{
  "text": "Push-ups, 10 reps, Perform with proper form",
  "targetLanguage": "es"
}
```

## Response Format

```json
{
  "translatedText": "Flexiones, 10 repeticiones, Realiza con la forma correcta"
}
```

## Examples

### English to Spanish
```javascript
// Input
{
  "text": "Push-ups, 10 reps, Perform with proper form",
  "targetLanguage": "es"
}

// Output
{
  "translatedText": "Flexiones, 10 repeticiones, Realiza con la forma correcta"
}
```

### English to French
```javascript
// Input
{
  "text": "Pull-ups, 5 sets, Keep your core tight",
  "targetLanguage": "fr"
}

// Output
{
  "translatedText": "Tractions, 5 séries, Gardez votre tronc serré"
}
```

### English to Japanese
```javascript
// Input
{
  "text": "Squats, 15 reps, Go as low as you can",
  "targetLanguage": "ja"
}

// Output
{
  "translatedText": "スクワット、15回、できるだけ低く下がってください"
}
```

## Integration Flow

1. **Exercise Detail Dialog** calls `fetchAndSetExerciseAudio(exerciseId, description)`
2. **WorkoutPageStore** checks if `selectedLanguage !== 'en'`
3. **If translation needed**, calls `translateText(description, selectedLanguage)`
4. **Translated text** is sent to voice generation API
5. **Voice generation** uses appropriate ElevenLabs model based on language

## Error Handling

- If translation fails, the original English text is used
- If OpenAI API is unavailable, the system falls back to English
- All errors are logged to console for debugging

## Environment Variables

Make sure to set the OpenAI API key in your environment:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Supported Languages

The translation system supports all languages that OpenAI GPT-3.5-turbo can translate to, including:

- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Russian (ru)
- Arabic (ar)
- And many more... 