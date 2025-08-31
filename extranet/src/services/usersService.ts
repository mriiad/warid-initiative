/**
 * Users Service
 * Handles all user management related API calls
 */

import type { UpdateUserData, UserProfileData } from '../types';
import type { DashboardData } from '../types/users';
import { apiClient } from '../utils/apiClient';

export const usersService = {
	getProfile: (userId?: string) => {
		const endpoint = userId
			? `/api/users/profile/${userId}`
			: '/api/user/profile';
		return apiClient.get(endpoint);
	},

	updateProfile: (userId: string, data: UserProfileData) => {
		return apiClient.put(`/api/users/${userId}`, data);
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

};
