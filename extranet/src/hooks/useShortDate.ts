import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';

/**
 * Narrows an i18next language tag to a locale Intl can be given.
 *
 * Mirrors applyDocumentDirection's normalization in src/i18n/index.ts:
 * `nonExplicitSupportedLngs` means i18n.language can carry a region
 * ("ar-MA"), so match on the base subtag rather than the whole tag. Falls
 * back to the app's own fallbackLng ('ar') rather than 'en', so an
 * unrecognized tag lands on the same language the rest of the UI shows.
 */
export const resolveDateLocale = (language?: string): SupportedLanguage => {
	const base = (language || '').split('-')[0] as SupportedLanguage;
	return SUPPORTED_LANGUAGES.includes(base) ? base : 'ar';
};

const SHORT_DATE: Intl.DateTimeFormatOptions = {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
};

/**
 * The app's one short-date format ("1 يناير 2099" / "Jan 1, 2099").
 *
 * Every caller used to inline `toLocaleDateString` itself, and four of
 * them passed `undefined` as the locale -- which means "the browser's
 * locale", not the language the user picked. That put "Jan 1, 2099" in
 * the event-detail hero directly above "1 يناير 2099" in the card below
 * it. See issue #386.
 */
export const formatShortDate = (date: Date, language?: string) =>
	date.toLocaleDateString(resolveDateLocale(language), SHORT_DATE);

/** Hook form, bound to the active language. */
export const useShortDate = () => {
	const { i18n } = useTranslation();
	return useCallback(
		(date: Date) => formatShortDate(date, i18n.language),
		[i18n.language]
	);
};
