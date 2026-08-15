/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import type {
	LoginData,
	RefreshTokenData,
	ResetPasswordData,
	SignupData,
	UpdatePasswordData,
} from '../types';
import { apiClient } from '../utils/apiClient';

export const authService = {
	signup: (data: SignupData) => {
		return apiClient.post('/api/auth/signup', data);
	},

	login: (data: LoginData) => {
		return apiClient.post('/api/auth/login', data);
	},

	logout: () => {
		return apiClient.post('/api/auth/logout');
	},

	refreshToken: (data: RefreshTokenData) => {
		return apiClient.post('/api/auth/refresh-token', data);
	},

	requestPasswordReset: (data: { email: string }) => {
		return apiClient.post('/api/auth/request-reset', data);
	},

	resetPassword: (token: string, data: ResetPasswordData) => {
		return apiClient.post(`/api/auth/reset-password/${token}`, data);
	},

	checkResetToken: (token: string) => {
		return apiClient.get(`/api/auth/check-reset-token/${token}`);
	},

	updatePassword: (data: UpdatePasswordData) => {
		return apiClient.patch('/api/auth/update-password', data);
	},
};
