import { describe, expect, it } from 'vitest';
import { toE164 } from './phone';

describe('toE164 (issue #466)', () => {
	it('adds the country code to a bare national number', () => {
		// The shape that rendered as nine digits with no leading zero, and
		// that the profile form then refused to save.
		expect(toE164('612345678')).toBe('+212612345678');
	});

	it('converts the Moroccan local format, dropping the trunk 0', () => {
		expect(toE164('0612345678')).toBe('+212612345678');
	});

	it('leaves a number that is already E.164 untouched', () => {
		expect(toE164('+212612345678')).toBe('+212612345678');
	});

	it('does not rewrite another country to +212', () => {
		expect(toE164('+33612345678')).toBe('+33612345678');
	});

	it('tolerates spacing in a stored value', () => {
		expect(toE164(' 06 12 34 56 78 ')).toBe('+212612345678');
	});

	it('returns an empty string for nothing at all', () => {
		expect(toE164('')).toBe('');
		expect(toE164(null)).toBe('');
		expect(toE164(undefined)).toBe('');
	});

	it('hands back anything it cannot make sense of, rather than guessing', () => {
		// A number that is merely unfamiliar must not be rewritten into a
		// different, confidently wrong one.
		expect(toE164('12')).toBe('12');
		expect(toE164('not a phone number')).toBe('not a phone number');
	});
});
