/**
 * Authentication Types
 * Request payloads for the auth endpoints, plus the shapes the auth *forms*
 * collect -- which are deliberately different (a form gathers fields the
 * signup endpoint never reads). Response shapes live in ./api.
 */

import type { Gender } from '../data/constants';

export interface LoginData {
	username: string;
	password: string;
}

export interface SignupData {
	username: string;
	email: string;
	password: string;
	gender: `${Gender}`;
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

/* ---- Form shapes (what a form collects, not what an endpoint takes) ---- */

export interface SignupFormData {
	username: string;
	firstName: string;
	lastName: string;
	birthDate: string;
	email: string;
	gender: string;
	password: string;
	phoneNumber: string;
	bloodGroup: string;
	lastDonationDate: string;
	donationType: string;
	// Client-side gate only -- never sent to the backend (see SignupForm's
	// onSubmit), which has no field for it and doesn't ask for it.
	privacyConsent: boolean;
}

export interface LoginFormData {
	username: string;
	password: string;
}
