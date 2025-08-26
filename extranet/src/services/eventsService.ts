/**
 * Events Service
 * Handles all events and donations related API calls
 */

import type {
	ConfirmPresenceData,
	DonationData,
	EventFormData,
} from '../types';
import { apiClient } from '../utils/apiClient';

export const eventsService = {
	getAll: (page = 1) => {
		return apiClient.get(`/api/events?page=${page}`);
	},

	getByReference: (reference: string) => {
		return apiClient.get(`/api/events/${reference}`);
	},

	create: (data: EventFormData) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					value.forEach((item, index) =>
						formData.append(`${key}[${index}]`, item)
					);
				} else {
					formData.append(key, value);
				}
			}
		});
		return apiClient.post('/api/events', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},

	update: (reference: string, data: EventFormData) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					value.forEach((item, index) =>
						formData.append(`${key}[${index}]`, item)
					);
				} else {
					formData.append(key, value);
				}
			}
		});
		return apiClient.put(`/api/events/${reference}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},

	delete: (reference: string) => {
		return apiClient.delete(`/api/events/${reference}`);
	},

	confirmPresence: (data: ConfirmPresenceData) => {
		return apiClient.post('/api/event/confirmPresence', data);
	},

	donate: (data: DonationData) => {
		return apiClient.post('/api/donation', data);
	},

	canDonate: () => {
		return apiClient.get('/api/donation/canDonate');
	},

	getDonationHistory: () => {
		return apiClient.get('/api/donation');
	},
};
