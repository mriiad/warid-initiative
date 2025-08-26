/**
 * Users Hooks
 * React Query hooks for user management functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services';
import type { UpdateUserData, UserProfileData } from '../types';

// Users hooks
export const useUserProfile = (userId?: string) => {
	return useQuery({
		queryKey: ['user', userId || 'me'],
		queryFn: () => usersService.getProfile(userId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: true, // Always enabled, will fetch current user's profile if no userId
	});
};

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ userId, data }: { userId: string; data: UserProfileData }) =>
			usersService.updateProfile(userId, data),
		onSuccess: (_, { userId }) => {
			// Invalidate user profile
			queryClient.invalidateQueries({ queryKey: ['user', userId] });
			queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
		},
		onError: (error) => {
			console.error('Profile update failed:', error);
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

export const useCheckProfileCompleteness = () => {
	return useQuery({
		queryKey: ['profileComplete'],
		queryFn: () => usersService.checkProfileCompleteness(),
		staleTime: 5 * 60 * 1000,
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
