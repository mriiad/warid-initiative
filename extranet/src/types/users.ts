/**
 * Users Types
 * Centralized types for user management functionality
 */

export interface UserProfileData {
	profile: {
		firstname: string;
		lastname: string;
		bloodGroup: string;
		city: string;
		phoneNumber: string;
		gender: 'male' | 'female';
	};
}

export interface UpdateUserData {
	username?: string;
	email?: string;
	phoneNumber?: string;
	gender?: 'male' | 'female';
}

export interface AdminUserUpdateData extends UpdateUserData {
	isActive?: boolean;
}
export interface DonationHistoryItem {
	id: string;
	date: string;
	type: string;
	event: string;
}

export interface DashboardStats {
	total: number;
	lastDonation: string | null;
	eligibleIn: string;
}

export interface DashboardData {
	stats: DashboardStats;
	donations: DonationHistoryItem[];
}

export interface AdminStats {
	totalUsers: number;
	totalEvents: number;
	totalDonations: number;
}
