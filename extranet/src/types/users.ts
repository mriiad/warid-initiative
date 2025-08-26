/**
 * Users Types
 * Centralized types for user management functionality
 */

export interface UserProfileData {
	profile: {
		firstname: string;
		lastname: string;
		bloodGroup: string;
		city: string;
		phoneNumber: string;
		gender: 'male' | 'female';
	};
}

export interface UpdateUserData {
	username?: string;
	email?: string;
	phoneNumber?: string;
	gender?: 'male' | 'female';
}

export interface AdminUserUpdateData extends UpdateUserData {
	isActive?: boolean;
}
