/**
 * Users Types
 * Request payloads and the profile form shapes. Response shapes live in
 * ./api.
 */

import type { BloodGroup, Gender } from '../data/constants';

export interface UpdateUserData {
	username?: string;
	email?: string;
	phoneNumber?: string;
	gender?: `${Gender}`;
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
	totalEmergencies: number;
}

/* ---- Profile form shapes ---- */

/** The subset of profile fields the "complete your profile" form collects. */
export interface ProfileFormData {
	firstname: string;
	lastname: string;
	birthdate: string;
	bloodGroup: BloodGroup;
	city: string;
}

/** ProfileFormData plus the account-level fields the profile screen edits. */
export interface UserFormData extends ProfileFormData {
	phoneNumber: string;
	email: string;
}
