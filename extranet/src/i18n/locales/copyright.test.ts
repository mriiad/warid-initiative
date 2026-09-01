import i18n from 'i18next';
import { describe, expect, it } from 'vitest';
import ar from './ar.json';
import en from './en.json';
import fr from './fr.json';

// The footer read "© 2024 WARID" in all three locales while the site was
// being served in 2026 -- the year was baked into the translation string.
// See issue #385.
describe('landing.copyright (issue #385)', () => {
	const locales = { ar, en, fr };

	it('takes the year as an interpolation rather than hardcoding one', () => {
		Object.entries(locales).forEach(([lang, data]) => {
			const value = (data as { landing: { copyright: string } }).landing.copyright;
			expect(value, `${lang} must interpolate the year`).toContain('{{year}}');
			expect(value, `${lang} must not hardcode a year`).not.toMatch(/\b(19|20)\d{2}\b/);
		});
	});

	it('renders the year it is given', () => {
		expect(i18n.t('landing.copyright', { year: 2031 })).toContain('2031');
	});
});
