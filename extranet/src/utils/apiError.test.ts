import { describe, expect, it, beforeEach } from 'vitest';
import i18n from '../i18n';
import { resolveApiErrorMessage } from './apiError';

const err = (data: unknown) => ({ response: { data } });
// i18n.t is itself a TFunction; wrapping it loses the brand the type wants.
const t = i18n.t.bind(i18n) as typeof i18n.t;

/**
 * The whole design rests on this ladder: translate what we recognise, and
 * never make an error *less* informative than it was before codes existed.
 * See issue #434.
 */
describe('resolveApiErrorMessage', () => {
	beforeEach(async () => {
		await i18n.changeLanguage('en');
	});

	it('prefers the app\'s own copy for a code it recognises', () => {
		expect(
			resolveApiErrorMessage(err({ code: 'WRONG_PASSWORD', message: 'Wrong password.' }), t)
		).toBe('Incorrect username or password.');
	});

	it('interpolates the params the backend sent', () => {
		expect(
			resolveApiErrorMessage(
				err({ code: 'DONATION_TOO_YOUNG', params: { minAge: 18 }, message: 'x' }),
				t
			)
		).toBe('You must be at least 18 to donate.');
	});

	it('translates into the active language', async () => {
		await i18n.changeLanguage('fr');
		expect(
			resolveApiErrorMessage(err({ code: 'EVENT_NOT_FOUND', message: 'Event not found' }), t)
		).toBe('Cet événement est introuvable.');
	});

	// A client deployed before a code exists must not print the key itself.
	it('falls back to the backend message for a code it does not know', () => {
		expect(
			resolveApiErrorMessage(
				err({ code: 'SOMETHING_ADDED_LATER', message: 'A specific reason.' }),
				t
			)
		).toBe('A specific reason.');
	});

	// Untagged endpoints are the majority and must be untouched.
	it('uses the backend message when there is no code at all', () => {
		expect(resolveApiErrorMessage(err({ message: 'A specific reason.' }), t)).toBe(
			'A specific reason.'
		);
	});

	it('reads the legacy `error` field when that is all there is', () => {
		expect(resolveApiErrorMessage(err({ error: 'Legacy shape.' }), t)).toBe('Legacy shape.');
	});

	it('falls back to a translated generic when the request never got a response', () => {
		expect(resolveApiErrorMessage(new Error('Network Error'), t)).toBe(
			'An error occurred.'
		);
	});

	it('never returns an empty string for an empty body', () => {
		expect(resolveApiErrorMessage(err({}), t)).toBe('An error occurred.');
	});

	// A screen with copy better than the bare generic keeps it: the login
	// form saying "incorrect username or password" tells the user more than
	// "an error occurred", and moving to codes must not take that away.
	it('prefers a caller-supplied fallback over the bare generic', () => {
		expect(resolveApiErrorMessage(err({}), t, 'Incorrect username or password.')).toBe(
			'Incorrect username or password.'
		);
	});

	it('still lets the backend message outrank a caller-supplied fallback', () => {
		expect(
			resolveApiErrorMessage(err({ message: 'A specific reason.' }), t, 'Generic-ish.')
		).toBe('A specific reason.');
	});
});
