/**
 * Events Types
 * Centralized types for events and donations functionality
 */

export interface EventFormData {
	title: string;
	subtitle?: string;
	description: string;
	date: string;
	location: string;
	mapLink?: string;
	isGeneric: boolean;
	image?: File;
}

export interface DonationData {
	bloodGroup: string;
	donationDate: string;
	donationType: string;
	eventId?: string;
}

export interface ConfirmPresenceData {
	eventId: string;
	token: string;
}
