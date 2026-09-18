/**
 * Emergency Hooks
 * React Query hooks for emergency functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emergencyService } from '../services';
import type { EmergencyData } from '../types';
import { queryKeys } from './queryKeys';

// GET /api/unconfirmedEmergencies is Emergency-Admin-or-Principal only
// (routes/emergency.js), and this polls on a 30s interval -- so a caller who
// does not show the result must be able to switch it off, or an Event Admin's
// dashboard re-requests a 403 twice a minute for as long as it is open.
// See issue #460.
export const useUnconfirmedEmergencies = (page = 1, enabled = true) => {
	return useQuery({
		queryKey: queryKeys.emergencies.unconfirmed.list(page),
		queryFn: () => emergencyService.getUnconfirmedEmergencies(page),
		staleTime: 2 * 60 * 1000,
		refetchInterval: 30 * 1000,
		enabled,
	});
};

export const useEmergencyMatchUsers = (
	emergencyId: string,
	page = 1,
	enabled = true
) => {
	return useQuery({
		queryKey: queryKeys.emergencies.matches(emergencyId, page),
		queryFn: () => emergencyService.getEmergencyMatchUsers(emergencyId, page),
		enabled: enabled && !!emergencyId,
		staleTime: 1 * 60 * 1000, // 1 minute
	});
};

export const useCreateEmergency = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: EmergencyData) => emergencyService.createEmergency(data),
		onSuccess: (response) => {
			// Invalidate unconfirmed emergencies list
			queryClient.invalidateQueries({
				queryKey: queryKeys.emergencies.unconfirmed.all,
			});
		},
		onError: (error) => {
			console.error('Emergency creation failed:', error);
		},
	});
};

export const useConfirmEmergency = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (emergencyId: string) =>
			emergencyService.confirmEmergency(emergencyId),
		onSuccess: (_, emergencyId) => {
			// Remove from unconfirmed list and invalidate related queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.emergencies.unconfirmed.all,
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.emergencies.detail(emergencyId) });
		},
		onError: (error) => {
			console.error('Emergency confirmation failed:', error);
		},
	});
};

export const useConfirmUserInEmergency = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			emergencyId,
			userId,
		}: {
			emergencyId: string;
			userId: string;
		}) => emergencyService.confirmUserInEmergency(emergencyId, userId),
		onSuccess: (_, { emergencyId }) => {
			// Invalidate emergency matches (and detail) and user data --
			// emergencies.detail(emergencyId) prefix-matches every matches()
			// page for this emergency, same as the ['emergencies', emergencyId]
			// literal this replaces.
			queryClient.invalidateQueries({
				queryKey: queryKeys.emergencies.detail(emergencyId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
		},
		onError: (error) => {
			console.error('User confirmation in emergency failed:', error);
		},
	});
};
