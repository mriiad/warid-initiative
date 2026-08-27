/**
 * Types Index
 * Single entry point for every shared type.
 *
 * Organised by what a type *is*, not by which folder it happened to land in:
 *
 *   - domain models   -- the objects the server stores (Event, Emergency, ...)
 *   - request payloads -- what we send to an endpoint (LoginData, ...)
 *   - form shapes      -- what a form collects, which is frequently NOT the
 *                         same as the payload (SignupFormData vs SignupData)
 *   - responses (./api) -- what each endpoint sends back
 *
 * These used to be split across src/data/ and src/types/ with no rule for
 * which to use, so the same server object was declared in several places and
 * drifted apart field by field (see issue #334).
 */

// Domain models
export type { Event } from './events';
export type { Emergency, MatchedUser } from './emergency';

// Request payloads
export type {
	LoginData,
	RefreshTokenData,
	ResetPasswordData,
	SignupData,
	UpdatePasswordData,
} from './auth';
export type { ConfirmPresenceData, DonationData, EventFormData } from './events';
export type { EmergencyData } from './emergency';
export type { ContactData } from './contact';
export type { UpdateUserData } from './users';

// Form shapes
export type { LoginFormData, SignupFormData } from './auth';
export type { ProfileFormData, UserFormData } from './users';

// Client-side view models
export type {
	AdminStats,
	DashboardData,
	DashboardStats,
	DonationHistoryItem,
} from './users';

// Server response shapes
export type {
	AdminRoleAssignmentResponse,
	AdminUserDetailResponse,
	ApiErrorResponse,
	CanDonateResponse,
	CheckParticipationResponse,
	EmergenciesListResponse,
	EmergencyMutationResponse,
	EventDetailResponse,
	EventMutationResponse,
	EventsListResponse,
	LoginResponse,
	MatchedUsersResponse,
	MessageResponse,
	ParticipantStatsResponse,
	ProfileCompletenessResponse,
	RefreshTokenResponse,
	SignupResponse,
	UserListItem,
	UserProfileResponse,
	UsersListResponse,
} from './api';
