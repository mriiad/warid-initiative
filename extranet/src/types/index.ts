/**
 * Types Index
 * Centralized export of all type definitions
 */

export type {
	LoginData,
	RefreshTokenData,
	ResetPasswordData,
	SignupData,
	UpdatePasswordData,
} from './auth';

export type {
	ConfirmPresenceData,
	DonationData,
	EventFormData,
} from './events';

export type {
	AdminUserUpdateData,
	UpdateUserData,
	UserProfileData,
} from './users';

export type { EmergencyData, MatchedUser } from './emergency';

export type { ContactData } from './contact';

// Server response shapes -- see the header comment in ./api for why these
// are kept distinct from the form-data types above.
export type {
	AdminUserDetailResponse,
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
