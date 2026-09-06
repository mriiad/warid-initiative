import type { TFunction } from 'i18next';

/**
 * The shape the API answers errors with. `code` and `params` are optional:
 * the backend tags an endpoint when it can, and everything else still
 * carries only the English `message` it always did. See issue #434.
 */
interface ApiErrorBody {
	message?: string;
	error?: string;
	code?: string;
	params?: Record<string, string | number>;
}

const bodyOf = (error: unknown): ApiErrorBody | undefined =>
	(error as { response?: { data?: ApiErrorBody } })?.response?.data;

/**
 * The message to show a user for a failed request, in their language where
 * that is possible.
 *
 * Order matters, and each step exists for a reason:
 *
 * 1. A recognised `code` wins. This is the only branch that produces
 *    translated copy, and `errors.<CODE>` interpolates whatever `params` the
 *    backend sent (a date, an age, a field name).
 * 2. An *unrecognised* code falls through rather than rendering the key
 *    itself. A client deployed before a new code exists must not show
 *    "errors.SOMETHING_NEW" on screen.
 * 3. The backend's own `message`. English, but specific -- and specific beat
 *    generic every time this was weighed before (issues #293, #332, #342,
 *    #344), so it stays ahead of any fallback.
 * 4. The caller's own copy, when it has something better than a bare
 *    generic. A login screen saying "incorrect username or password" tells
 *    the user more than "an error occurred", and this must not take that
 *    away from screens that already had it.
 * 5. `common.error`, the generic the app already used here, for a request
 *    that failed before any response came back at all. Deliberately not a
 *    second generic string of its own -- one meaning, one key.
 */
export const resolveApiErrorMessage = (
	error: unknown,
	t: TFunction,
	fallback?: string
): string => {
	const body = bodyOf(error);

	if (body?.code) {
		const key = `errors.${body.code}`;
		const translated = t(key, { ...(body.params ?? {}), defaultValue: '' });
		if (translated) return translated as string;
	}

	return body?.message || body?.error || fallback || (t('common.error') as string);
};
