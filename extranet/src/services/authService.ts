/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import type {
	LoginData,
	LoginResponse,
	MessageResponse,
	RefreshTokenData,
	RefreshTokenResponse,
	ResetPasswordData,
	SignupData,
	SignupResponse,
	UpdatePasswordData,
} from '../types';
import { apiClient } from '../utils/apiClient';

export const authService = {
	signup: (data: SignupData) => {
		return apiClient.post<SignupResponse>('/api/auth/signup', data);
	},

	login: (data: LoginData) => {
		return apiClient.post<LoginResponse>('/api/auth/login', data);
	},

	logout: () => {
		return apiClient.post<MessageResponse>('/api/auth/logout');
	},

	refreshToken: (data: RefreshTokenData) => {
		return apiClient.post<RefreshTokenResponse>('/api/auth/refresh-token', data);
	},

	requestPasswordReset: (data: { email: string }) => {
		return apiClient.post<MessageResponse>('/api/auth/request-reset', data);
	},

	resetPassword: (token: string, data: ResetPasswordData) => {
		return apiClient.post<MessageResponse>(`/api/auth/reset-password/${token}`, data);
	},

	checkResetToken: (token: string) => {
		return apiClient.get<MessageResponse>(`/api/auth/check-reset-token/${token}`);
	},

	activateAccount: (token: string) => {
		return apiClient.get<MessageResponse>(`/api/auth/activation/${token}`);
	},

	updatePassword: (data: UpdatePasswordData) => {
		return apiClient.patch<MessageResponse>('/api/auth/update-password', data);
	},
};
