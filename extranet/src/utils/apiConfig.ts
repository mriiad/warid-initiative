/**
 * Frontend API Configuration
 * Centralized API endpoints and configuration for the frontend
 */

import { getEnvVar } from '../config/env-config';

const API_CONFIG = {
	baseURL: getEnvVar('API_URL'),
	frontendURL: getEnvVar('FRONTEND_URL'),

	endpoints: {
		auth: {
			signup: '/api/auth/signup',
			login: '/api/auth/login',
			logout: '/api/auth/logout',
			refreshToken: '/api/auth/refresh-token',
			requestReset: '/api/auth/request-reset',
			resetPassword: (token: string) => `/api/auth/reset-password/${token}`,
			checkResetToken: (token: string) =>
				`/api/auth/check-reset-token/${token}`,
			activation: (code: string) => `/api/auth/activation/${code}`,
		},

		users: {
			list: (page?: number) => `/api/users${page ? `?page=${page}` : ''}`,
			profile: (userId: string) => `/api/users/profile/${userId}`,
			update: (userId: string) => `/api/users/${userId}`,
			search: '/api/searchUsers',
			delete: (username: string) => `/api/deleteUser/${username}`,
			toggleAdmin: (userId: string) => `/api/users/${userId}/admin`,
			dashboard: (userId: string) => `/api/users/${userId}/dashboard`,
		},

		events: {
			list: (page?: number) => `/api/events${page ? `?page=${page}` : ''}`,
			create: '/api/event',
			update: (reference: string) => `/api/event/${reference}`,
			delete: (reference: string) => `/api/event/${reference}`,
			details: '/api/event',
		},

		contact: '/api/contact-us',
	},

	request: {
		timeout: 10000,
		retries: 3,
		headers: {
			'Content-Type': 'application/json',
		},
	},

	ui: {
		snackbarDuration: 3000,
		redirectDelay: 3000,
		pagination: {
			itemsPerPage: 10,
		},
	},

	features: {
		enableDebug: getEnvVar('NODE_ENV') === 'development',
		enableAnalytics: false,
	},
};

export const buildApiUrl = (endpoint: string): string => {
	return `${API_CONFIG.baseURL}${endpoint}`;
};

export const buildFrontendUrl = (path: string): string => {
	return `${API_CONFIG.frontendURL}${path}`;
};
export default API_CONFIG;
