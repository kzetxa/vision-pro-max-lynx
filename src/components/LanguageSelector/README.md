# LanguageSelector Component

A dropdown component that allows users to select their preferred language for voice generation in the workout app.

## Features

- **100+ Languages**: Supports over 100 languages including major world languages
- **Accessible**: Proper labels and ARIA attributes
- **Responsive**: Works well on mobile and desktop
- **Theme Integration**: Uses the app's design system and theme variables
- **TypeScript**: Fully typed with TypeScript interfaces

## Usage

```tsx
import LanguageSelector from '../components/LanguageSelector/LanguageSelector';

function MyComponent() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  return (
    <LanguageSelector
      selectedLanguage={selectedLanguage}
      onLanguageChange={setSelectedLanguage}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedLanguage` | `string` | Yes | The currently selected language code (e.g., 'en', 'es', 'fr') |
| `onLanguageChange` | `(language: string) => void` | Yes | Callback function called when language is changed |

## Supported Languages

The component includes support for over 100 languages including:

- **European Languages**: English, Spanish, French, German, Italian, Portuguese, Dutch, Swedish, Danish, Norwegian, Finnish, etc.
- **Asian Languages**: Japanese, Korean, Chinese, Thai, Vietnamese, Hindi, Bengali, Urdu, etc.
- **Middle Eastern Languages**: Arabic, Hebrew, Persian, Turkish, etc.
- **African Languages**: Swahili, Zulu, Afrikaans, Amharic, etc.
- **And many more...**

## Integration with Voice Generation

This component is designed to work with the voice generation system:

1. When a user selects a language, it updates the `WorkoutPageStore.selectedLanguage`
2. The selected language is automatically saved to localStorage for persistence
3. The selected language is passed to the `getOrGenerateAudio` function
4. The voice generation API uses the appropriate ElevenLabs model based on the language
5. Audio files are cached per language, so switching languages will generate new audio if needed

## Local Storage Persistence

The selected language is automatically persisted in the browser's localStorage:

- **Storage Key**: `selectedVoiceLanguage`
- **Default Value**: `'en'` (English)
- **Persistence**: Survives browser sessions and page refreshes
- **Scope**: Global across all workouts and sessions

The language preference is loaded when the WorkoutPageStore is initialized and saved whenever the user changes their selection.

## Styling

The component uses CSS modules and integrates with the app's theme system:

- Uses theme variables for colors, spacing, and border radius
- Responsive design that adapts to mobile screens
- Consistent with the app's design language
- Focus states for accessibility

## Accessibility

- Proper `label` and `id` association
- Keyboard navigation support
- Screen reader friendly
- High contrast support through theme variables 