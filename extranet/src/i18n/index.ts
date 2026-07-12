import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export const SUPPORTED_LANGUAGES = ['ar', 'en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

export const applyDocumentDirection = (lng: string) => {
	const lang = (lng.split('-')[0] as SupportedLanguage) || 'ar';
	document.documentElement.lang = lang;
	document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			ar: { translation: ar },
			en: { translation: en },
			fr: { translation: fr },
		},
		// The association is Moroccan and the existing UI is Arabic-first, so
		// Arabic is the sensible default for first-time visitors.
		fallbackLng: 'ar',
		supportedLngs: [...SUPPORTED_LANGUAGES],
		nonExplicitSupportedLngs: true,
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ['localStorage', 'navigator'],
			caches: ['localStorage'],
			lookupLocalStorage: 'warid_language',
		},
	});

applyDocumentDirection(i18n.resolvedLanguage || i18n.language);
i18n.on('languageChanged', applyDocumentDirection);

export default i18n;
