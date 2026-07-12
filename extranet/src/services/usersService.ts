/**
 * Users Service
 * Handles all user management related API calls
 */

import type { UserFormData } from '../data/ProfileFormData';
import type { UpdateUserData } from '../types';
import type { AdminStats, DashboardData } from '../types/users';
import { apiClient } from '../utils/apiClient';

export const usersService = {
	getProfile: (userId?: string) => {
		const endpoint = userId
			? `/api/users/profile/${userId}`
			: '/api/user/profile';
		return apiClient.get(endpoint);
	},

	// Self-service update of the logged-in user's own profile. Resolves the
	// user from the auth token server-side (PATCH /api/user/profile), unlike
	// updateUserInfo below which targets an admin-supplied :userId.
	// phoneNumber is sent as a number to match the User schema's type.
	updateMyProfile: (
		data: Partial<Omit<UserFormData, 'phoneNumber'>> & { phoneNumber?: number }
	) => {
		return apiClient.patch('/api/user/profile', data);
	},

	updateUserInfo: (userId: string, data: UpdateUserData) => {
		return apiClient.put(`/api/users/${userId}`, data);
	},

	checkProfileCompleteness: () => {
		return apiClient.get('/api/user/check-profile');
	},
	getAllUsers: (page = 1) => {
		return apiClient.get(`/api/users?page=${page}`);
	},

	searchUsers: (query: string) => {
		return apiClient.get(`/api/searchUsers?q=${query}`);
	},

	deleteUser: (username: string) => {
		return apiClient.delete(`/api/deleteUser/${username}`);
	},

	toggleAdminStatus: (userId: string) => {
		return apiClient.patch(`/api/users/${userId}/admin`);
	},
	getDashboard: async (userId: string): Promise<DashboardData> => {
		const res = await apiClient.get<DashboardData>(`/api/users/${userId}/dashboard`);
		return res.data;
	},

	getAdminStats: async (): Promise<AdminStats> => {
		const res = await apiClient.get<AdminStats>('/api/admin/stats');
		return res.data;
	},

};
