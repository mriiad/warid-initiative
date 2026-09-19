import { parsePhoneNumber } from 'react-phone-number-input';

// The country the app assumes when a stored number carries no calling code.
// Same default PhoneNumberField gives its picker, so a value normalised here
// and a value typed into the field agree.
const DEFAULT_COUNTRY = 'MA';

/**
 * Puts a stored phone number into the E.164 shape the phone field and every
 * validator in the app expect ('+212612345678').
 *
 * Numbers reached the database in more than one shape. Signup has required
 * E.164 for a while, but older records hold the Moroccan local format
 * ('0612345678' -- see the note on the phoneNumber validator in
 * routes/user.js), and some hold the bare national number with neither the
 * trunk '0' nor a calling code ('612345678').
 *
 * Handed either of those, PhoneNumberField rendered the digits verbatim: the
 * country picker could not match them, so the user saw a number missing its
 * leading zero, and saving was then refused by the profile form's own
 * `/^\+[1-9]\d{6,14}$/` check -- with no way forward except typing the
 * country code by hand on every single edit. See issue #466.
 *
 * Deliberately conservative. Anything already in E.164 is returned untouched,
 * and anything this cannot make sense of is returned as it came rather than
 * guessed at -- a number that is merely unfamiliar must not be rewritten into
 * a different, confidently wrong one.
 */
export const toE164 = (value?: string | null): string => {
	const raw = String(value ?? '').trim();
	if (!raw) return '';
	// Already international: leave it alone, whatever country it belongs to.
	if (raw.startsWith('+')) return raw;

	try {
		const parsed = parsePhoneNumber(raw, DEFAULT_COUNTRY as never);
		// `number` is the E.164 form. Only trust it when the library also
		// considers the result a possible number for that country, so a string
		// of digits that happens to parse into something implausible is left
		// as it was.
		if (parsed?.number && parsed.isPossible()) {
			return parsed.number;
		}
	} catch {
		// parsePhoneNumber throws on input it cannot make sense of at all.
	}

	return raw;
};
