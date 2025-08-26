/**
 * Emergency Hooks
 * React Query hooks for emergency functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { emergencyService } from '../services';
import type { EmergencyData } from '../types';

export const useUnconfirmedEmergencies = (page = 1) => {
	return useQuery({
		queryKey: ['emergencies', 'unconfirmed', page],
		queryFn: () => emergencyService.getUnconfirmedEmergencies(page),
		staleTime: 2 * 60 * 1000,
		refetchInterval: 30 * 1000,
	});
};

export const useEmergencyMatchUsers = (
	emergencyId: string,
	page = 1,
	enabled = true
) => {
	return useQuery({
		queryKey: ['emergencies', emergencyId, 'matches', page],
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
				queryKey: ['emergencies', 'unconfirmed'],
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
				queryKey: ['emergencies', 'unconfirmed'],
			});
			queryClient.invalidateQueries({ queryKey: ['emergencies', emergencyId] });
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
			// Invalidate emergency matches and user data
			queryClient.invalidateQueries({
				queryKey: ['emergencies', emergencyId, 'matches'],
			});
			queryClient.invalidateQueries({ queryKey: ['user'] });
		},
		onError: (error) => {
			console.error('User confirmation in emergency failed:', error);
		},
	});
};
