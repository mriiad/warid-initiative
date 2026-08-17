/**
 * Events Service
 * Handles all events and donations related API calls
 */

import type {
	CanDonateResponse,
	CheckParticipationResponse,
	ConfirmPresenceData,
	DonationData,
	EventDetailResponse,
	EventFormData,
	EventMutationResponse,
	EventsListResponse,
	MessageResponse,
	ParticipantStatsResponse,
} from '../types';
import { apiClient } from '../utils/apiClient';

export const eventsService = {
	getAll: (page = 1) => {
		return apiClient.get<EventsListResponse>(`/api/events?page=${page}`);
	},

	getByReference: (reference: string) => {
		return apiClient.get<EventDetailResponse>(`/api/events/${reference}`);
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
		return apiClient.post<EventMutationResponse>('/api/event', formData, {
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
		// Singular /api/event/:reference -- the only update route the backend
		// actually registers (src/routes/event.js). This used to PUT the
		// plural /api/events/:reference instead, which matches no route at
		// all: every admin "edit event" save 404'd.
		return apiClient.put<EventMutationResponse>(`/api/event/${reference}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},

	delete: (reference: string) => {
		// The backend's only delete route is DELETE /api/event with the
		// reference in the body, not a /:reference URL segment (see
		// src/routes/event.js). This used to DELETE the plural
		// /api/events/:reference, which also matches no route: every admin
		// "delete event" 404'd.
		return apiClient.delete<EventMutationResponse>('/api/event', { data: { reference } });
	},

	confirmPresence: (data: ConfirmPresenceData) => {
		return apiClient.post<MessageResponse>('/api/event/confirmPresence', data);
	},

	donate: (data: DonationData) => {
		return apiClient.post<MessageResponse>('/api/donation', data);
	},

	canDonate: () => {
		return apiClient.get<CanDonateResponse>('/api/donation/canDonate');
	},

	getDonationHistory: () => {
		return apiClient.get('/api/donation');
	},
	createParticipant: (reference: string) => {
		return apiClient.post<MessageResponse>(`/api/participate/${reference}`);
	},

	checkParticipation: (reference: string) => {
		return apiClient.get<CheckParticipationResponse>(`/api/check/${reference}`);
	},

	getEventParticipantsDetails: (reference: string) => {
		return apiClient.get<ParticipantStatsResponse>(`/api/event/${reference}/participants/details`);
	},
};
