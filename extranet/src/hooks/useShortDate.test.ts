import { describe, expect, it } from 'vitest';
import { formatShortDate, resolveDateLocale } from './useShortDate';

// Four components formatted dates with toLocaleDateString(undefined, ...),
// which means "the browser's locale" -- not the language the user chose.
// The event detail page showed "Jan 1, 2099" directly above the same date
// rendered as "1 يناير 2099". See issue #386.
describe('resolveDateLocale (issue #386)', () => {
	it('accepts the supported languages', () => {
		expect(resolveDateLocale('ar')).toBe('ar');
		expect(resolveDateLocale('fr')).toBe('fr');
		expect(resolveDateLocale('en')).toBe('en');
	});

	it('matches on the base subtag, since nonExplicitSupportedLngs allows a region', () => {
		// The previous per-component narrowing compared the whole tag, so
		// "ar-MA" fell through to English.
		expect(resolveDateLocale('ar-MA')).toBe('ar');
		expect(resolveDateLocale('fr-FR')).toBe('fr');
	});

	it("falls back to the app's own fallbackLng for anything unrecognized", () => {
		expect(resolveDateLocale('de')).toBe('ar');
		expect(resolveDateLocale(undefined)).toBe('ar');
		expect(resolveDateLocale('')).toBe('ar');
	});
});

describe('formatShortDate (issue #386)', () => {
	const date = new Date('2099-01-01T00:00:00.000Z');

	it('formats in the language it is given, not the environment default', () => {
		expect(formatShortDate(date, 'en')).toMatch(/Jan/);
		expect(formatShortDate(date, 'ar')).toMatch(/يناير/);
	});

	it('renders one date the same way regardless of which caller asks', () => {
		// The whole point of the shared helper: two components showing the
		// same date on the same screen can no longer disagree.
		expect(formatShortDate(date, 'ar')).toBe(formatShortDate(date, 'ar-MA'));
	});
});
