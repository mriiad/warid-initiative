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

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	(error) => {
		// Handle unauthorized errors (token expired)
		if (error.response?.status === 401) {
			// Clear local storage and redirect to login
			localStorage.removeItem('token');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('userId');
			localStorage.removeItem('isAdmin');

			// Only redirect if not already on login page
			if (window.location.pathname !== '/login') {
				window.location.href = '/login';
			}
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
