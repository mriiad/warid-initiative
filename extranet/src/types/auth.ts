/**
 * Authentication Types
 * Centralized types for authentication functionality
 */

export interface LoginData {
	username: string;
	password: string;
}

export interface SignupData {
	username: string;
	email: string;
	password: string;
	gender: 'male' | 'female';
	phoneNumber: string;
}

export interface RefreshTokenData {
	refreshToken: string;
}

export interface ResetPasswordData {
	password: string;
}

export interface UpdatePasswordData {
	currentPassword: string;
	newPassword: string;
}
