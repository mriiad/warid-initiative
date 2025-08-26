/**
 * Emergency Service
 * Handles all emergency related API calls
 */

import type { EmergencyData } from '../types';
import { apiClient } from '../utils/apiClient';

export const emergencyService = {
	getUnconfirmedEmergencies: (page = 1) => {
		return apiClient.get(`/api/unconfirmedEmergencies?page=${page}`);
	},

	getEmergencyMatchUsers: (emergencyId: string, page = 1) => {
		return apiClient.get(
			`/api/emergencies/${emergencyId}/matchingUsers?page=${page}`
		);
	},

	createEmergency: (data: EmergencyData) => {
		return apiClient.post('/api/emergency', data);
	},

	confirmEmergency: (emergencyId: string) => {
		return apiClient.patch(`/api/emergencies/${emergencyId}/confirm`);
	},

	confirmUserInEmergency: (emergencyId: string, userId: string) => {
		return apiClient.patch(
			`/api/emergencies/${emergencyId}/matchedUsers/${userId}/confirm`
		);
	},
};
