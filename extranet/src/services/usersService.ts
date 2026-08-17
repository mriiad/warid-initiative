/**
 * Users Service
 * Handles all user management related API calls
 */

import type { UserFormData } from '../data/ProfileFormData';
import type {
	AdminUserDetailResponse,
	MessageResponse,
	ProfileCompletenessResponse,
	UpdateUserData,
	UserProfileResponse,
	UsersListResponse,
} from '../types';
import type { AdminStats, DashboardData } from '../types/users';
import { apiClient } from '../utils/apiClient';

export const usersService = {
	// The logged-in user's own profile. Resolved from the auth token
	// server-side; returns the profile fields at the top level.
	getMyProfile: () => {
		return apiClient.get<UserProfileResponse>('/api/user/profile');
	},

	// Admin-only lookup of another user. A different endpoint returning a
	// different shape (account fields like username/isAdmin/canDonate on top
	// of the profile fields) -- these two used to share one `getProfile`
	// method overloaded on whether a userId was passed, which hid the fact
	// that callers were getting two incompatible payloads.
	getUserById: (userId: string) => {
		return apiClient.get<AdminUserDetailResponse>(`/api/users/profile/${userId}`);
	},

	// Self-service update of the logged-in user's own profile. Resolves the
	// user from the auth token server-side (PATCH /api/user/profile), unlike
	// updateUserInfo below which targets an admin-supplied :userId.
	//
	// This 404s if the user has no Profile document yet, so it isn't safe
	// for a brand-new user completing their profile for the first time --
	// use completeMyProfile below for that screen instead.
	updateMyProfile: (data: Partial<UserFormData>) => {
		return apiClient.patch<MessageResponse>('/api/user/profile', data);
	},

	// The "complete your profile" screen a brand-new user is sent to right
	// after signup (UserProfileForm). PUT /api/user/update creates the
	// Profile document if it doesn't exist yet, unlike updateMyProfile above,
	// which requires one to already be there.
	completeMyProfile: (data: Partial<UserFormData>) => {
		return apiClient.put<MessageResponse>('/api/user/update', data);
	},

	updateUserInfo: (userId: string, data: UpdateUserData) => {
		return apiClient.put<MessageResponse>(`/api/users/${userId}`, data);
	},

	checkProfileCompleteness: () => {
		return apiClient.get<ProfileCompletenessResponse>('/api/user/check-profile');
	},
	getAllUsers: (page = 1) => {
		return apiClient.get<UsersListResponse>(`/api/users?page=${page}`);
	},

	// POST, not GET: the backend route (isAuth + checkIfAdmin) takes its
	// filters from req.body and is only ever registered as .post(...) --
	// this used to GET with a single ?q= param, which matches no route at
	// all (POST-only) and was never reachable.
	searchUsers: (filters: Record<string, string | number | boolean>) => {
		return apiClient.post<UsersListResponse>('/api/searchUsers', filters);
	},

	deleteUser: (username: string) => {
		return apiClient.delete<MessageResponse>(`/api/deleteUser/${username}`);
	},

	toggleAdminStatus: (userId: string) => {
		return apiClient.patch<MessageResponse>(`/api/users/${userId}/admin`);
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
