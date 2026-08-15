/**
 * Events Hooks
 * React Query hooks for events and donations functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useErrorToast } from '../components/shared/ErrorToastProvider';
import { eventsService } from '../services';
import type {
	ConfirmPresenceData,
	DonationData,
	EventFormData,
} from '../types';
import { queryKeys } from './queryKeys';

// Events hooks
export const useEvents = (page = 1) => {
	return useQuery({
		queryKey: queryKeys.events.list(page),
		queryFn: () => eventsService.getAll(page),
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useEvent = (reference: string, enabled = true) => {
	return useQuery({
		queryKey: queryKeys.event.detail(reference),
		queryFn: () => eventsService.getByReference(reference),
		enabled: enabled && !!reference,
	});
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: EventFormData) => eventsService.create(data),
		onSuccess: (response) => {
			// Invalidate and refetch events
			queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
		},
		onError: (error) => {
			console.error('Event creation failed:', error);
		},
	});
};

// Not currently wired to any component -- UpdateEvent.tsx calls apiClient
// directly and has its own try/catch + error UI. Kept consistent with the
// other mutations regardless.
export const useUpdateEvent = () => {
	const queryClient = useQueryClient();
	const { showError } = useErrorToast();

	return useMutation({
		mutationFn: ({
			reference,
			data,
		}: {
			reference: string;
			data: EventFormData;
		}) => eventsService.update(reference, data),
		onSuccess: (_, { reference }) => {
			// Invalidate specific event and events list
			queryClient.invalidateQueries({ queryKey: queryKeys.event.detail(reference) });
			queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
		},
		onError: (error) => {
			console.error('Event update failed:', error);
			showError(error);
		},
	});
};

// Not currently wired to any component -- EventDetail.tsx calls
// eventsService.delete directly and has its own try/catch + message UI.
// Kept consistent with the other mutations regardless.
export const useDeleteEvent = () => {
	const queryClient = useQueryClient();
	const { showError } = useErrorToast();

	return useMutation({
		mutationFn: (reference: string) => eventsService.delete(reference),
		onSuccess: (_, reference) => {
			// Remove from cache and invalidate list
			queryClient.removeQueries({ queryKey: queryKeys.event.detail(reference) });
			queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
		},
		onError: (error) => {
			console.error('Event deletion failed:', error);
			showError(error);
		},
	});
};

export const useConfirmPresence = () => {
	return useMutation({
		mutationFn: (data: ConfirmPresenceData) =>
			eventsService.confirmPresence(data),
		onSuccess: (response) => {
			// You might want to invalidate user data or event data here
		},
		onError: (error) => {
			console.error('Presence confirmation failed:', error);
		},
	});
};

// Donations hooks
export const useDonate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: DonationData) => eventsService.donate(data),
		onSuccess: (response) => {
			// Invalidate donation history and user profile
			queryClient.invalidateQueries({ queryKey: queryKeys.donations() });
			queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
		},
		onError: (error) => {
			console.error('Donation failed:', error);
		},
	});
};

export const useCanDonate = () => {
	return useQuery({
		queryKey: queryKeys.canDonate(),
		queryFn: () => eventsService.canDonate(),
	});
};

export const useDonationHistory = () => {
	return useQuery({
		queryKey: queryKeys.donations(),
		queryFn: () => eventsService.getDonationHistory(),
	});
};

export const useCheckParticipation = (reference: string) => {
	return useQuery({
		queryKey: queryKeys.checkParticipation(reference),
		queryFn: () => eventsService.checkParticipation(reference),
	});
};

export const useCreateParticipant = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (reference: string) => eventsService.createParticipant(reference),
		onSuccess: (_, reference) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.checkParticipation(reference) });
			queryClient.invalidateQueries({ queryKey: queryKeys.eventParticipants(reference) });
		},
		onError: (error) => {
			console.error('Participant registration failed:', error);
		},
	});
};

export interface ParticipantStats {
  isGeneric: boolean;
  allDonaters: number;
  registeredParticipants?: number;
  realDonaters?: number;
}

export const useEventParticipantsDetails = (reference: string, enabled = true) => {
  return useQuery<ParticipantStats>({
    queryKey: queryKeys.eventParticipants(reference),
    queryFn: async () => {
      const response = await eventsService.getEventParticipantsDetails(reference);
      const data = response.data;

      if (data.isGeneric) {
        return {
		  isGeneric: true,
          allDonaters: data.allDonaters,
        };
      } else {
        return {
		  isGeneric: false,
          allDonaters: data.allDonaters,
          registeredParticipants: data.registeredParticipants,
          realDonaters: data.realDonaters,
        };
      }
    },
    enabled,
  });
};
