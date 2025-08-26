/**
 * Contact Hooks
 * React Query hooks for contact functionality
 */

import { useMutation } from '@tanstack/react-query';
import { contactService } from '../services';
import type { ContactData } from '../types';

// Contact hooks
export const useSendMessage = () => {
	return useMutation({
		mutationFn: (data: ContactData) => contactService.sendMessage(data),
		onSuccess: (response) => {
			// Message sent successfully
		},
		onError: (error) => {
			console.error('Message sending failed:', error);
		},
	});
};
