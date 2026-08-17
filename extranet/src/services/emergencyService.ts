/**
 * Emergency Service
 * Handles all emergency related API calls
 */

import type {
	EmergenciesListResponse,
	EmergencyData,
	EmergencyMutationResponse,
	MatchedUsersResponse,
	MessageResponse,
} from '../types';
import { apiClient } from '../utils/apiClient';

export const emergencyService = {
	getUnconfirmedEmergencies: (page = 1) => {
		return apiClient.get<EmergenciesListResponse>(`/api/unconfirmedEmergencies?page=${page}`);
	},

	getEmergencyMatchUsers: (emergencyId: string, page = 1) => {
		return apiClient.get<MatchedUsersResponse>(
			`/api/emergencies/${emergencyId}/matchingUsers?page=${page}`
		);
	},

	createEmergency: (data: EmergencyData) => {
		return apiClient.post<EmergencyMutationResponse>('/api/emergency', data);
	},

	confirmEmergency: (emergencyId: string) => {
		return apiClient.patch<MessageResponse>(`/api/emergencies/${emergencyId}/confirm`);
	},

	confirmUserInEmergency: (emergencyId: string, userId: string) => {
		return apiClient.patch<MessageResponse>(
			`/api/emergencies/${emergencyId}/matchedUsers/${userId}/confirm`
		);
	},
};
