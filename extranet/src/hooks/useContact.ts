/**
 * Contact Hooks
 * React Query hooks for contact functionality
 */

import { useMutation } from '@tanstack/react-query';
import { useErrorToast } from '../components/shared/ErrorToastProvider';
import { contactService } from '../services';
import type { ContactData } from '../types';

// Contact hooks
// Not currently wired to any component -- ContactForm.tsx calls
// contactService.sendMessage directly and has its own try/catch +
// ResponseAnimation UI. Kept consistent with the other mutations regardless.
export const useSendMessage = () => {
	const { showError } = useErrorToast();

	return useMutation({
		mutationFn: (data: ContactData) => contactService.sendMessage(data),
		onSuccess: (response) => {
			// Message sent successfully
		},
		onError: (error) => {
			console.error('Message sending failed:', error);
			showError(error);
		},
	});
};
