/**
 * Events Hooks
 * React Query hooks for events and donations functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { eventsService } from '../services';
import type {
	ConfirmPresenceData,
	DonationData,
	EventFormData,
} from '../types';

// Events hooks
export const useEvents = (page = 1) => {
	return useQuery({
		queryKey: ['events', page],
		queryFn: () => eventsService.getAll(page),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

export const useEvent = (reference: string, enabled = true) => {
	return useQuery({
		queryKey: ['event', reference],
		queryFn: () => eventsService.getByReference(reference),
		enabled: enabled && !!reference,
		staleTime: 5 * 60 * 1000,
	});
};

export const useCreateEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: EventFormData) => eventsService.create(data),
		onSuccess: (response) => {
			// Invalidate and refetch events
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			console.error('Event creation failed:', error);
		},
	});
};

export const useUpdateEvent = () => {
	const queryClient = useQueryClient();

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
			queryClient.invalidateQueries({ queryKey: ['event', reference] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			console.error('Event update failed:', error);
		},
	});
};

export const useDeleteEvent = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (reference: string) => eventsService.delete(reference),
		onSuccess: (_, reference) => {
			// Remove from cache and invalidate list
			queryClient.removeQueries({ queryKey: ['event', reference] });
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			console.error('Event deletion failed:', error);
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
			queryClient.invalidateQueries({ queryKey: ['donations'] });
			queryClient.invalidateQueries({ queryKey: ['user'] });
		},
		onError: (error) => {
			console.error('Donation failed:', error);
		},
	});
};

export const useCanDonate = () => {
	return useQuery({
		queryKey: ['canDonate'],
		queryFn: () => eventsService.canDonate(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useDonationHistory = () => {
	return useQuery({
		queryKey: ['donations'],
		queryFn: () => eventsService.getDonationHistory(),
		staleTime: 5 * 60 * 1000,
	});
};

export const useCheckParticipation = (reference: string) => {
	return useQuery({
		queryKey: ['checkParticipation', reference],
		queryFn: () => eventsService.checkParticipation(reference),
		staleTime: 5 * 60 * 1000,
	});
};

export const useCreateParticipant = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (reference: string) => eventsService.createParticipant(reference),
		onSuccess: (_, reference) => {
			queryClient.invalidateQueries({ queryKey: ['checkParticipation', reference] });
			queryClient.invalidateQueries({ queryKey: ['eventParticipants', reference] });
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
    queryKey: ['eventParticipants', reference],
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
    staleTime: 5 * 60 * 1000,
  });
};
