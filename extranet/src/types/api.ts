/**
 * API Response Types
 *
 * The shape of what each endpoint actually returns, transcribed from the
 * Express controllers in `src/controllers/`. These are deliberately kept
 * apart from the form-data types (`EventFormData`, `SignupFormData`, ...):
 * those describe what a form collects, these describe what the server sends
 * back, and the two are frequently not the same shape.
 *
 * Why this exists: services used to return an untyped `AxiosResponse<any>`,
 * so every caller hand-drilled into it (`response.data.event.title`) with no
 * checking whatsoever. That is exactly how issues #196 and #205 happened --
 * both were code reading `event.data.title` when the real payload nests one
 * level deeper at `event.data.event.title`. `any` made them invisible to the
 * compiler and they shipped. With these types wired through `apiClient`,
 * that same mistake is a build error.
 */

import type { AdminRole, BloodGroup } from '../data/constants';
import type { Emergency, MatchedUser } from './emergency';
import type { Event } from './events';

/** Almost every endpoint includes a human-readable message. */
export interface MessageResponse {
	message: string;
}

/* -------------------------------------------------------------------------
 * Events
 * ---------------------------------------------------------------------- */

/** GET /api/events?page=N -- note: no `message` field on this one. */
export interface EventsListResponse {
	events: Event[];
	totalItems: number;
}

/**
 * GET /api/events/:reference
 * The `event` nesting here is the one that caused #196 and #205.
 */
export interface EventDetailResponse extends MessageResponse {
	event: Event;
}

/** POST /api/event, PUT|DELETE /api/event/:reference */
export interface EventMutationResponse extends MessageResponse {
	event: Pick<Event, '_id' | 'reference'> & Partial<Event>;
}

/** GET /api/event/:reference/participants/details */
export interface ParticipantStatsResponse extends MessageResponse {
	eventReference: string;
	isGeneric?: boolean;
	allDonaters?: number;
	realDonaters?: number;
	registeredParticipants?: number;
}

/** GET /api/check/:reference */
export interface CheckParticipationResponse {
	hasParticipated: boolean;
}

/** GET /api/canDonate */
export interface CanDonateResponse {
	canDonate: boolean;
	message?: string;
	nextEligibleDate?: string;
}

/* -------------------------------------------------------------------------
 * Auth
 * ---------------------------------------------------------------------- */

/** POST /api/auth/signup */
export interface SignupResponse extends MessageResponse {
	userId: string;
}

/** POST /api/auth/login */
export interface LoginResponse {
	token: string;
	refreshToken: string;
	userId: string;
	isAdmin: boolean;
	/** Undefined for a plain admin from before roles existed -- see src/auth/adminAccess.ts. */
	role?: AdminRole;
}

/**
 * POST /api/auth/refresh-token
 * Note the field is `accessToken`, NOT `token` -- this endpoint is the one
 * place the backend names it differently (every other place uses `token`).
 * Confirmed against src/controllers/auth.js and apiClient's refresh
 * interceptor, which both read `accessToken`.
 */
export interface RefreshTokenResponse {
	accessToken: string;
	refreshToken: string;
}

/* -------------------------------------------------------------------------
 * Users
 * ---------------------------------------------------------------------- */

/**
 * GET /api/user/profile -- returns the profile fields at the TOP level, not
 * wrapped in a `profile` key. When the user has no profile row yet the
 * server sends `{ gender }` alone, hence everything but `gender` optional.
 */
export interface UserProfileResponse {
	gender: string;
	firstname?: string;
	lastname?: string;
	birthdate?: string;
	bloodGroup?: BloodGroup;
	city?: string;
	phoneNumber?: string;
	email?: string;
}

/**
 * GET /api/users/profile/:userId -- the ADMIN-only lookup of *another*
 * user. A genuinely different shape from UserProfileResponse above: it
 * carries account-level fields (username, isAdmin, canDonate) that the
 * self-service endpoint never returns, and spreads the profile fields in
 * only when a Profile document exists (hence the optionals).
 *
 * These two endpoints were both fronted by a single `usersService.getProfile`
 * overloaded on whether you passed a userId, which is how the difference
 * stayed invisible.
 */
export interface AdminUserDetailResponse {
	_id: string;
	username: string;
	email: string;
	phoneNumber?: string;
	isAdmin: boolean;
	/** Meaningful only when isAdmin is true. Undefined for a plain admin from before roles existed -- see src/auth/adminAccess.ts. */
	role?: AdminRole;
	gender: string;
	canDonate: boolean;
	firstname?: string;
	lastname?: string;
	birthdate?: string;
	bloodGroup?: BloodGroup;
	city?: string;
}

/** GET /api/users?page=N and POST /api/searchUsers */
export interface UsersListResponse extends MessageResponse {
	users: UserListItem[];
	totalItems: number;
}

export interface UserListItem {
	_id: string;
	username?: string;
	email?: string;
	phoneNumber?: string;
	isAdmin?: boolean;
	role?: AdminRole;
	firstname?: string;
	lastname?: string;
	bloodGroup?: BloodGroup;
	city?: string;
}

/** PATCH /api/users/:userId/admin -- role assignment (issue #183). */
export interface AdminRoleAssignmentResponse extends MessageResponse {
	role: AdminRole;
}

/** GET /api/checkUserProfile */
export interface ProfileCompletenessResponse {
	isProfileComplete: boolean;
	message?: string;
}

/* -------------------------------------------------------------------------
 * Emergencies
 * ---------------------------------------------------------------------- */

/** GET /api/unconfirmedEmergencies?page=N */
export interface EmergenciesListResponse extends MessageResponse {
	emergencies: Emergency[];
	totalItems: number;
}

/** GET /api/emergencies/:id/matchingUsers?page=N */
export interface MatchedUsersResponse extends MessageResponse {
	matchingUsers: MatchedUser[];
	totalItems: number;
}

/** POST /api/emergency */
export interface EmergencyMutationResponse extends MessageResponse {
	emergency: Emergency;
}

/* -------------------------------------------------------------------------
 * Errors
 * ---------------------------------------------------------------------- */

/**
 * The single error shape the API returns, for every failure, from every
 * controller (see src/middleware/error-handler.js and ApiError).
 *
 * This used to be `{ errorMessage, errorKeys }` -- the shape ApiError sent --
 * while the error middleware's other branch sent `{ message, statusCode }`
 * for anything that wasn't an ApiError. Two shapes for the same concept, so
 * whether a caller could read the reason depended on which controller it
 * happened to hit.
 */
export interface ApiErrorResponse {
	message: string;
	statusCode?: number;
	/** Field names that failed validation, for per-field form errors. */
	errorKeys?: string[];
}
