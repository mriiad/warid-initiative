/**
 * The single error shape the API now returns, for every failure, from every
 * controller (see src/middleware/error-handler.js and ApiError).
 *
 * This used to be `{ errorMessage, errorKeys }` -- the shape ApiError sent --
 * while the error middleware's other branch sent `{ message, statusCode }`
 * for anything that wasn't an ApiError. Two shapes for the same concept, so
 * whether a caller could read the reason depended on which controller it
 * happened to hit. The shared error toast only ever looked for `message`,
 * which meant every ApiError endpoint (donations, emergencies, events)
 * silently degraded to a generic "an error occurred".
 */
export interface ApiErrorResponse {
	message: string;
	statusCode?: number;
	/** Field names that failed validation, for per-field form errors. */
	errorKeys?: string[];
}
