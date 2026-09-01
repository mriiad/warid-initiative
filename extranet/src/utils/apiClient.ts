import axios, { AxiosInstance, AxiosResponse } from 'axios';
import API_CONFIG from './apiConfig';

// Create axios instance with base configuration
export const apiClient: AxiosInstance = axios.create({
	baseURL: API_CONFIG.baseURL,
	timeout: API_CONFIG.request.timeout,
	headers: API_CONFIG.request.headers,
});

// Request interceptor for authentication
apiClient.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Requests that can't be retried by refreshing: the login attempt itself has
// no session to refresh, and retrying a failed refresh with another refresh
// would recurse forever.
const NON_REFRESHABLE_ENDPOINTS = [
	API_CONFIG.endpoints.auth.login,
	API_CONFIG.endpoints.auth.refreshToken,
];

/**
 * Every real API call goes through this instance (see services/*.ts), so
 * this is the one interceptor a 401 anywhere in the app actually hits.
 *
 * Used to just wipe the session and hard-redirect to /login on any 401 --
 * there was a second, separate refresh-and-retry interceptor patched onto
 * the *global* axios object (auth/useAxiosInterceptor.tsx), but since
 * nothing routes real traffic through plain axios, that logic never ran for
 * anything a user actually did. Every access-token expiry force-logged
 * users out even though their still-valid refresh token could have kept
 * them signed in silently. See issue #304.
 */
// Shared across every concurrent 401: the backend rotates refresh tokens
// (single-use -- see refreshToken in src/controllers/auth.js), so two
// requests that both hit a 401 at once and each called attemptRefresh()
// independently would both read the same, still-current refresh token from
// localStorage, but only the first to reach the server actually succeeds --
// the second gets REFRESH_TOKEN_NOT_VALID and looks like a dead session,
// logging the user out even though the first refresh just proved it wasn't.
// A page firing several parallel queries on load hits exactly this. Every
// concurrent caller now awaits the same in-flight refresh instead of
// starting its own. See issue #373.
let refreshPromise: Promise<string | null> | null = null;

const attemptRefresh = (): Promise<string | null> => {
	if (refreshPromise) {
		return refreshPromise;
	}

	refreshPromise = (async () => {
		const refreshToken = localStorage.getItem('refreshToken');
		if (!refreshToken) {
			return null;
		}

		const response = await axios.post(
			`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.refreshToken}`,
			{ refreshToken }
		);
		const { accessToken, refreshToken: newRefreshToken } = response.data;

		localStorage.setItem('token', accessToken);
		localStorage.setItem('refreshToken', newRefreshToken);
		// AuthContext holds its own in-memory copy of the token, populated at
		// login and otherwise never touched -- without this it would go stale
		// the instant a silent refresh happens. apiClient is a plain module
		// with no access to the context, so it announces the change instead
		// of setting it directly; AuthContext listens for this event.
		window.dispatchEvent(new Event('auth:token-refreshed'));

		return accessToken;
	})();

	// Cleared once settled (success or failure) so the *next* 401, whenever
	// it happens, starts a fresh refresh rather than reusing this one.
	return refreshPromise.finally(() => {
		refreshPromise = null;
	});
};

const clearSessionAndRedirectToLogin = () => {
	localStorage.removeItem('token');
	localStorage.removeItem('refreshToken');
	localStorage.removeItem('userId');
	localStorage.removeItem('isAdmin');
	localStorage.removeItem('adminRole');

	// Only redirect if not already on login page.
	if (window.location.pathname !== '/login') {
		window.location.href = '/login';
	}
};

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401) {
			const canRetry =
				originalRequest &&
				!originalRequest._retry &&
				!NON_REFRESHABLE_ENDPOINTS.includes(originalRequest.url);

			if (canRetry) {
				originalRequest._retry = true;
				try {
					const newToken = await attemptRefresh();
					if (newToken) {
						originalRequest.headers.Authorization = `Bearer ${newToken}`;
						return apiClient(originalRequest);
					}
				} catch (refreshError) {
					console.error('Token refresh failed:', refreshError);
					// Fall through to the session-clearing branch below --
					// the refresh token itself is no longer valid.
				}
			}

			// Either this request can't be retried (it was the login or
			// refresh call itself, or a retry already failed once), or the
			// refresh attempt above didn't produce a usable token: the
			// session is genuinely over.
			clearSessionAndRedirectToLogin();
		}

		// Handle network errors
		if (!error.response) {
			console.error('Network error:', error.message);
			// You could show a toast notification here
		}

		return Promise.reject(error);
	}
);

// Helper function to handle API errors consistently
export const handleApiError = (error: any): string => {
	if (error.response?.data?.message) {
		return error.response.data.message;
	}
	if (error.response?.data?.error) {
		return error.response.data.error;
	}
	if (error.message) {
		return error.message;
	}
	return 'An unexpected error occurred';
};

// Helper function to create form data for file uploads
export const createFormData = (data: Record<string, any>): FormData => {
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			if (Array.isArray(value)) {
				value.forEach((item, index) => {
					formData.append(`${key}[${index}]`, item);
				});
			} else {
				formData.append(key, value);
			}
		}
	});
	return formData;
};

export default apiClient;
