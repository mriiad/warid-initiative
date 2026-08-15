/**
 * Users Hooks
 * React Query hooks for user management functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserFormData } from '../data/ProfileFormData';
import { usersService } from '../services';
import type { UpdateUserData } from '../types';
import type { AdminStats, DashboardData } from '../types/users';
import { queryKeys } from './queryKeys';

// Users hooks
export const useUserProfile = (userId?: string) => {
	return useQuery({
		queryKey: userId ? queryKeys.user.detail(userId) : queryKeys.user.me(),
		queryFn: () => usersService.getProfile(userId),
		enabled: true, // Always enabled, will fetch current user's profile if no userId
	});
};

export const useUpdateMyProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<UserFormData>) => usersService.updateMyProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
		},
		onError: (error) => {
			console.error('Profile update failed:', error);
		},
	});
};

export const useCompleteMyProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<UserFormData>) => usersService.completeMyProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
		},
		onError: (error) => {
			console.error('Profile completion failed:', error);
		},
	});
};

export const useUpdateUserInfo = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
			usersService.updateUserInfo(userId, data),
		onSuccess: (_, { userId }) => {
			// Invalidate user data
			queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
		},
		onError: (error) => {
			console.error('User info update failed:', error);
		},
	});
};

// The backend route (isAuth-gated) always 401s without a token, so this
// defaults to disabled -- LoginForm enables it only once login.isSuccess.
// Firing it unconditionally used to mean every visit to /login sent a
// doomed, unauthenticated request; see the enabled-gating note on that
// component for the failure this caused (issue #195).
export const useCheckProfileCompleteness = (enabled = false) => {
	return useQuery({
		queryKey: queryKeys.profileComplete(),
		queryFn: () => usersService.checkProfileCompleteness(),
		enabled,
	});
};

// Admin hooks
export const useUsers = (page = 1) => {
	return useQuery({
		queryKey: queryKeys.users.list(page),
		queryFn: () => usersService.getAllUsers(page),
	});
};

export const useSearchUsers = (
	filters: Record<string, string | number | boolean>,
	enabled = true
) => {
	return useQuery({
		queryKey: queryKeys.users.search(filters),
		queryFn: () => usersService.searchUsers(filters),
		enabled: enabled && Object.keys(filters).length > 0,
		staleTime: 2 * 60 * 1000, // 2 minutes for search results
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (username: string) => usersService.deleteUser(username),
		onSuccess: (response, username) => {
			// Invalidate users list
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
		},
		onError: (error) => {
			console.error('User deletion failed:', error);
		},
	});
};

export const useToggleAdminStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (userId: string) => usersService.toggleAdminStatus(userId),
		onSuccess: (response, userId) => {
			// Invalidate users list and specific user
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
		},
		onError: (error) => {
			console.error('Admin status toggle failed:', error);
		},
	});
};

export const useDashboard = (userId: string) => {
  return useQuery<DashboardData>({
    queryKey: queryKeys.dashboard(userId),
    queryFn: () => usersService.getDashboard(userId),
  });
};

export const useAdminStats = () => {
	return useQuery<AdminStats>({
		queryKey: queryKeys.adminStats(),
		queryFn: () => usersService.getAdminStats(),
	});
};
