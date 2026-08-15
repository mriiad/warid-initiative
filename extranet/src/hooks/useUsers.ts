/**
 * Users Hooks
 * React Query hooks for user management functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserFormData } from '../data/ProfileFormData';
import { usersService } from '../services';
import type { UpdateUserData } from '../types';
import type { AdminStats, DashboardData } from '../types/users';

// Users hooks
export const useUserProfile = (userId?: string) => {
	return useQuery({
		queryKey: ['user', userId || 'me'],
		queryFn: () => usersService.getProfile(userId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: true, // Always enabled, will fetch current user's profile if no userId
	});
};

export const useUpdateMyProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: Partial<UserFormData>) => usersService.updateMyProfile(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
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
			queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
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
			queryClient.invalidateQueries({ queryKey: ['user', userId] });
			queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
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
		queryKey: ['profileComplete'],
		queryFn: () => usersService.checkProfileCompleteness(),
		staleTime: 5 * 60 * 1000,
		enabled,
	});
};

// Admin hooks
export const useUsers = (page = 1) => {
	return useQuery({
		queryKey: ['users', page],
		queryFn: () => usersService.getAllUsers(page),
		staleTime: 5 * 60 * 1000,
	});
};

export const useSearchUsers = (query: string, enabled = true) => {
	return useQuery({
		queryKey: ['users', 'search', query],
		queryFn: () => usersService.searchUsers(query),
		enabled: enabled && !!query,
		staleTime: 2 * 60 * 1000, // 2 minutes for search results
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (username: string) => usersService.deleteUser(username),
		onSuccess: (response, username) => {
			// Invalidate users list
			queryClient.invalidateQueries({ queryKey: ['users'] });
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
			queryClient.invalidateQueries({ queryKey: ['users'] });
			queryClient.invalidateQueries({ queryKey: ['user', userId] });
		},
		onError: (error) => {
			console.error('Admin status toggle failed:', error);
		},
	});
};

export const useDashboard = (userId: string) => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => usersService.getDashboard(userId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminStats = () => {
	return useQuery<AdminStats>({
		queryKey: ['adminStats'],
		queryFn: () => usersService.getAdminStats(),
		staleTime: 5 * 60 * 1000,
	});
};




