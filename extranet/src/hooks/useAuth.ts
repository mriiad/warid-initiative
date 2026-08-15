/**
 * Authentication Hooks
 * React Query hooks for authentication functionality
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services';
import type {
	LoginData,
	RefreshTokenData,
	ResetPasswordData,
	SignupData,
	UpdatePasswordData,
} from '../types';
import { queryKeys } from './queryKeys';

export const useSignup = () => {
	return useMutation({
		mutationFn: (data: SignupData) => authService.signup(data),
		onSuccess: (response) => {},
		onError: (error) => {
			console.error('Signup failed:', error);
		},
	});
};

export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: LoginData) => authService.login(data),
		onSuccess: (response) => {
			const { token, refreshToken, userId, isAdmin } = response.data;
			localStorage.setItem('token', token);
			localStorage.setItem('refreshToken', refreshToken);
			localStorage.setItem('userId', userId);
			localStorage.setItem('isAdmin', String(isAdmin));

			// Force immediate update of queries and clear cache
			queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
			queryClient.clear(); // Clear all cached data to ensure fresh state
		},
		onError: (error) => {
			console.error('Login failed:', error);
		},
	});
};

export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => authService.logout(),
		onSuccess: () => {
			localStorage.removeItem('token');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('userId');
			localStorage.removeItem('isAdmin');
			queryClient.clear();
		},
		onError: (error) => {
			console.error('Logout failed:', error);
		},
	});
};

export const useRefreshToken = () => {
	return useMutation({
		mutationFn: (data: RefreshTokenData) => authService.refreshToken(data),
		onSuccess: (response) => {
			const { accessToken, refreshToken } = response.data;
			localStorage.setItem('token', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
		},
		onError: (error) => {
			console.error('Token refresh failed:', error);
		},
	});
};

export const useRequestPasswordReset = () => {
	return useMutation({
		mutationFn: (data: { email: string }) =>
			authService.requestPasswordReset(data),
		onSuccess: (response) => {
			// Password reset request sent successfully
		},
		onError: (error) => {
			console.error('Password reset request failed:', error);
		},
	});
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: ({ token, data }: { token: string; data: ResetPasswordData }) =>
			authService.resetPassword(token, data),
		onSuccess: (response) => {
			// Password reset successful
		},
		onError: (error) => {
			console.error('Password reset failed:', error);
		},
	});
};

export const useCheckResetToken = (token = '', enabled = true) => {
	return useMutation({
		mutationFn: () => authService.checkResetToken(token),
		onSuccess: (response) => {
			// Token is valid
		},
		onError: (error) => {
			console.error('Token validation failed:', error);
		},
	});
};

export const useUpdatePassword = () => {
	return useMutation({
		mutationFn: (data: UpdatePasswordData) => authService.updatePassword(data),
		onSuccess: (response) => {
			// Password updated successfully
		},
		onError: (error) => {
			console.error('Password update failed:', error);
		},
	});
};

// Combined useAuth hook that returns all auth hooks
export const useAuth = () => {
	return {
		signup: useSignup(),
		login: useLogin(),
		logout: useLogout(),
		refreshToken: useRefreshToken(),
		requestPasswordReset: useRequestPasswordReset(),
		resetPassword: useResetPassword(),
		checkResetToken: useCheckResetToken(),
		updatePassword: useUpdatePassword(),
	};
};
