import React from 'react';
import styles from './LanguageSelector.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../contexts/StoreContext';

const SUPPORTED_LANGUAGES = {
	'en': 'English',
	'es': 'Spanish',
	'fr': 'French',
	'de': 'German',
	'it': 'Italian',
	'pt': 'Portuguese',
	'pl': 'Polish',
	'hi': 'Hindi',
	'ja': 'Japanese',
	'ko': 'Korean',
	'zh': 'Chinese',
	'ru': 'Russian',
	'ar': 'Arabic',
	'nl': 'Dutch',
	'sv': 'Swedish',
	'da': 'Danish',
	'no': 'Norwegian',
	'fi': 'Finnish',
	'tr': 'Turkish',
	'he': 'Hebrew',
	'th': 'Thai',
	'vi': 'Vietnamese',
	'cs': 'Czech',
	'sk': 'Slovak',
	'hu': 'Hungarian',
	'ro': 'Romanian',
	'bg': 'Bulgarian',
	'hr': 'Croatian',
	'sl': 'Slovenian',
	'et': 'Estonian',
	'lv': 'Latvian',
	'lt': 'Lithuanian',
	'el': 'Greek',
	'id': 'Indonesian',
	'ms': 'Malay',
	'uk': 'Ukrainian',
	'be': 'Belarusian',
	'ka': 'Georgian',
	'hy': 'Armenian',
	'az': 'Azerbaijani',
	'kk': 'Kazakh',
	'ky': 'Kyrgyz',
	'uz': 'Uzbek',
	'tg': 'Tajik',
	'tm': 'Turkmen',
	'mn': 'Mongolian',
	'my': 'Burmese',
	'km': 'Khmer',
	'lo': 'Lao',
	'ne': 'Nepali',
	'si': 'Sinhala',
	'bn': 'Bengali',
	'ur': 'Urdu',
	'fa': 'Persian',
	'ps': 'Pashto',
	'ku': 'Kurdish',
	'yi': 'Yiddish',
	'am': 'Amharic',
	'sw': 'Swahili',
	'zu': 'Zulu',
	'af': 'Afrikaans',
	'xh': 'Xhosa',
	'st': 'Southern Sotho',
	'tn': 'Tswana',
	'ts': 'Tsonga',
	've': 'Venda',
	'nr': 'Southern Ndebele',
	'ss': 'Swati',
	'nd': 'Northern Ndebele',
	'rw': 'Kinyarwanda',
	'lg': 'Ganda',
	'ak': 'Akan',
	'yo': 'Yoruba',
	'ig': 'Igbo',
	'ha': 'Hausa',
	'ff': 'Fulah',
	'wo': 'Wolof',
	'sn': 'Shona'
};

const LanguageSelector: React.FC = observer(() => {
	const { workoutPageStore } = useStore();

	return (
		<div className={styles.languageSelector}>
			<label htmlFor="language-select" className={styles.label}>
				Voice Language:
			</label>
			<select
				id="language-select"
				value={workoutPageStore.selectedLanguage}
				onChange={(e) => workoutPageStore.setLanguage(e.target.value)}
				className={styles.select}
			>
				{Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
					<option key={code} value={code}>
						{name}
					</option>
				))}
			</select>
		</div>
	);
});

export default LanguageSelector; 