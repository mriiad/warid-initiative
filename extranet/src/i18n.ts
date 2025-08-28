import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import arTranslations from './locales/ar.json';
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const resources = {
	en: {
		translation: enTranslations,
	},
	fr: {
		translation: frTranslations,
	},
	ar: {
		translation: arTranslations,
	},
};

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: 'fr',
		defaultNS: 'translation',
		ns: ['translation'],

		interpolation: {
			escapeValue: false,
		},

		detection: {
			order: ['localStorage', 'navigator', 'htmlTag'],
			lookupLocalStorage: 'i18nextLng',
			caches: ['localStorage'],
		},

		react: {
			useSuspense: false,
		},
	});

export default i18n;
