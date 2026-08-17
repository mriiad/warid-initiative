/**
 * Events Types
 * The Event domain model, plus the request payloads for event/donation
 * endpoints. Response shapes live in ./api.
 */

import type { BloodGroup } from '../data/constants';

/** The event object as the server stores and returns it. */
export interface Event {
	_id: string;
	reference: string;
	title: string;
	image: string;
	subtitle: string;
	location: string;
	date: string;
	mapLink: string;
	description: string;
	isGeneric: boolean;
	createdAt?: string;
	qrCode?: string;
}

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
	bloodGroup: BloodGroup | string;
	donationDate: string;
	donationType: string;
	eventId?: string;
}

export interface ConfirmPresenceData {
	eventId: string;
	token: string;
}
