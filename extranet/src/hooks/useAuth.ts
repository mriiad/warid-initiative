/**
 * Authentication Hooks
 * React Query hooks for authentication functionality
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useErrorToast } from '../components/shared/ErrorToastProvider';
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
	const { showError } = useErrorToast();

	return useMutation({
		mutationFn: (data: SignupData) => authService.signup(data),
		onSuccess: (response) => {},
		onError: (error) => {
			console.error('Signup failed:', error);
			showError(error);
		},
	});
};

// SignupForm.tsx / LoginForm.tsx handle their own errors, both reading the
// backend message rather than the mutation's onError. useLogin specifically:
// LoginForm reacts to login.isError/login.error to render its own inline
// snackbar (issue #293) -- adding the shared toast here would duplicate that
// message every time.
export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: LoginData) => authService.login(data),
		onSuccess: (response) => {
			const { token, refreshToken, userId, isAdmin, role } = response.data;
			localStorage.setItem('token', token);
			localStorage.setItem('refreshToken', refreshToken);
			localStorage.setItem('userId', userId);
			localStorage.setItem('isAdmin', String(isAdmin));
			// Undefined for a plain admin from before roles existed (see
			// adminAccess.ts) -- cleared rather than stored as the string
			// "undefined", which would otherwise satisfy AuthContext's
			// `localStorage.getItem('adminRole') as AdminRole | null` read as
			// if it were a real (invalid) role.
			if (role) {
				localStorage.setItem('adminRole', role);
			} else {
				localStorage.removeItem('adminRole');
			}

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
		// onSettled, not onSuccess: clearing the device is the part that must
		// never fail. Previously a network blip left every token in
		// localStorage -- the user pressed "log out", got an error toast, and
		// was still logged in. The server call is best-effort revocation of
		// the refresh token on top of that, not a precondition for it.
		// See issue #404.
		onSettled: () => {
			localStorage.removeItem('token');
			localStorage.removeItem('refreshToken');
			localStorage.removeItem('userId');
			localStorage.removeItem('isAdmin');
			localStorage.removeItem('adminRole');
			queryClient.clear();
		},
		onError: (error) => {
			// Logged, not shown: the user is logged out locally either way, so
			// a toast here would contradict what just visibly happened.
			console.error('Logout failed:', error);
		},
	});
};

// Not currently wired to any component -- apiClient.ts's response
// interceptor does the real silent-refresh-on-401 itself via a plain axios
// call, deliberately outside React Query (it has to run from an interceptor,
// not a hook). Kept consistent with the other 22 mutations regardless, in
// case that ever changes.
export const useRefreshToken = () => {
	const { showError } = useErrorToast();

	return useMutation({
		mutationFn: (data: RefreshTokenData) => authService.refreshToken(data),
		onSuccess: (response) => {
			const { accessToken, refreshToken } = response.data;
			localStorage.setItem('token', accessToken);
			localStorage.setItem('refreshToken', refreshToken);
		},
		onError: (error) => {
			console.error('Token refresh failed:', error);
			showError(error);
		},
	});
};

export const useRequestPasswordReset = () => {
	const { showError } = useErrorToast();

	return useMutation({
		mutationFn: (data: { email: string }) =>
			authService.requestPasswordReset(data),
		onSuccess: (response) => {
			// Password reset request sent successfully
		},
		onError: (error) => {
			console.error('Password reset request failed:', error);
			showError(error);
		},
	});
};

export const useResetPassword = () => {
	const { showError } = useErrorToast();

	return useMutation({
		mutationFn: ({ token, data }: { token: string; data: ResetPasswordData }) =>
			authService.resetPassword(token, data),
		onSuccess: (response) => {
			// Password reset successful
		},
		onError: (error) => {
			console.error('Password reset failed:', error);
			showError(error);
		},
	});
};

// LoginForm surfaces this itself (next to the "please confirm your email"
// rejection), reading its own success/error state rather than the shared
// toast -- same reasoning as useLogin above.
export const useResendActivation = () => {
	return useMutation({
		mutationFn: (data: { email: string }) => authService.resendActivation(data),
		onSuccess: (response) => {
			// A new activation email was sent (or the request was a no-op --
			// the response is deliberately the same either way, see #365).
		},
		onError: (error) => {
			console.error('Resending the activation email failed:', error);
		},
	});
};

export const useCheckResetToken = (token = '', enabled = true) => {
	const { showError } = useErrorToast();

	return useMutation({
		mutationFn: () => authService.checkResetToken(token),
		onSuccess: (response) => {
			// Token is valid
		},
		onError: (error) => {
			console.error('Token validation failed:', error);
			showError(error);
		},
	});
};

// ProfileComponent.tsx already shows the backend's own message on failure
// (see handlePasswordSave) -- the shared toast would just repeat it.
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
		resendActivation: useResendActivation(),
	};
};
