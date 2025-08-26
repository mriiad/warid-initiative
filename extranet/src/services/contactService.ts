/**
 * Contact Service
 * Handles all contact form related API calls
 */

import type { ContactData } from '../types';
import { apiClient } from '../utils/apiClient';

export const contactService = {
	sendMessage: (data: ContactData) => {
		return apiClient.post('/api/contact-us', data);
	},
};
