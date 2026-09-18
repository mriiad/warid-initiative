/**
 * Stable identifiers for the errors a user actually reads.
 *
 * The API's `message` is English prose assembled in the controllers, and the
 * clients deliberately prefer it over their own copy -- that was the right
 * call at the time (issues #293, #332, #342, #344: a generic fallback hid
 * *which* thing went wrong), but it made English the primary error surface
 * of an Arabic-first app. See issue #434.
 *
 * A code travels alongside the message rather than replacing it, so the
 * client can translate what it recognises and fall back to the prose for
 * anything it doesn't. That means an endpoint can be tagged whenever it's
 * convenient, and an untagged one behaves exactly as it does today.
 *
 * Codes are part of the API contract: rename one and older clients quietly
 * fall back to English. Add rather than rename.
 */
const ERROR_CODES = {
	// --- auth ---
	USER_NOT_FOUND: 'USER_NOT_FOUND',
	WRONG_PASSWORD: 'WRONG_PASSWORD',
	ACCOUNT_NOT_ACTIVATED: 'ACCOUNT_NOT_ACTIVATED',
	TOKEN_INVALID_OR_EXPIRED: 'TOKEN_INVALID_OR_EXPIRED',
	REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
	CURRENT_PASSWORD_INCORRECT: 'CURRENT_PASSWORD_INCORRECT',

	// --- donating ---
	// params: { minAge } / { maxAge } / { nextDonationDate }
	DONATION_MISSING_BIRTHDATE: 'DONATION_MISSING_BIRTHDATE',
	DONATION_TOO_YOUNG: 'DONATION_TOO_YOUNG',
	DONATION_TOO_OLD: 'DONATION_TOO_OLD',
	DONATION_COOLDOWN: 'DONATION_COOLDOWN',
	DONATION_DATE_IN_FUTURE: 'DONATION_DATE_IN_FUTURE',
	DONATION_DATE_IN_REST_PERIOD: 'DONATION_DATE_IN_REST_PERIOD',
	// Raised both when a plain donation has no generic event to attach to and
	// when deleting an event has no generic event to reassign its donations
	// to -- one missing piece of configuration, described once.
	NO_GENERIC_EVENT: 'NO_GENERIC_EVENT',

	// --- events and participation ---
	EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
	PARTICIPATION_NOT_ELIGIBLE: 'PARTICIPATION_NOT_ELIGIBLE',

	// --- raised centrally by the error middleware ---
	// DUPLICATE_VALUE covers signup's duplicate email and CIN too: neither is
	// thrown explicitly (constants.USER_ALREADY_EXISTS / CIN_ALREADY_EXISTS
	// are defined but unused), so both arrive as an E11000 from the unique
	// index and are translated here. params: { field }
	DUPLICATE_VALUE: 'DUPLICATE_VALUE',
	// The server is willing but not configured to send mail: the contact form
	// has nowhere to deliver to. Distinct from SERVER_ERROR because it is a
	// deployment gap a visitor can do nothing about, and distinct from mail
	// being deliberately disabled, which is not an error at all.
	MAIL_NOT_CONFIGURED: 'MAIL_NOT_CONFIGURED',
	VALIDATION_FAILED: 'VALIDATION_FAILED',
	SERVER_ERROR: 'SERVER_ERROR',
};

module.exports = { ERROR_CODES };
