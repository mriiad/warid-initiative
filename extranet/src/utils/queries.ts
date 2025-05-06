import axios from 'axios';

export const fetchEventByReference = async (reference: string) => {
	try {
		const response = await axios.get(`/api/events/${reference}`);
		return response.data.event;
	} catch (error) {
		throw new Error(error.message);
	}
};

export const donate = async (data: {
	bloodGroup: string;
	donationDate: string;
	donationType: string;
	eventId?: string;
}): Promise<{ message: string }> => {
	try {
		const response = await axios.post('/api/donation', data);
		return response.data;
	} catch (error) {
		throw error.response;
	}
};

export const fetchCanDonate = async () => {
	try {
		const response = await axios.get('/api/donation/canDonate');
		return response.data.canDonate;
	} catch (error) {
		throw new Error(error.message);
	}
};

export const fetchDonation = async () => {
	try {
		const response = await axios.get('/api/donation');
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};

export const confirmEventPresence = async (
	reference: string,
	token: string
): Promise<{
	message: string;
}> => {
	try {
		const response = await axios.put(
			'/api/event/confirmPresence',
			{ reference },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	} catch (error) {
		throw error.response;
	}
};

export const createEvent = async (
	data: FormData
): Promise<{ message: string }> => {
	try {
		const response = await axios.post('http://localhost:3000/api/event', data, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data;
	} catch (error) {
		throw error.response;
	}
};

export const checkProfileCompleteness = async () => {
	try {
		const response = await axios.get('/api/user/check-profile');
		const { isProfileComplete } = response.data;
		return isProfileComplete;
	} catch (error) {
		console.error('Error checking profile completeness:', error);
		return false;
	}
};

export const fetchUserProfile = async () => {
	try {
		const response = await axios.get('/api/user/profile');
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};

export const fetchEvents = async () => {
	try {
		const response = await axios.get('/api/event');
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};

export const deleteUser = async (username: string, token: string) => {
	try {
		const response = await axios.delete(`/api/deleteUser/${username}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};


// Get list of unconfirmed emergencies
export const fetchUnconfirmedEmergencies = async (page: number , token: string) => {
	try {
		const response = await axios.get(`/api/unconfirmedEmergencies?page=${page}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};

// Get matched users for a specific emergency
export const fetchEmergencyMatchUsers = async (emergencyId: string, token: string, currentPage: number) => {
	try {
		const response = await axios.get(`/api/emergencies/${emergencyId}/matchingUsers?page=${currentPage}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};

// Create a new emergency
export const createEmergency = async (data: {
	bloodGroup: string;
	city: string;
	phoneNumber: number;
	details: string;
}): Promise<{ message: string; emergency: any }> => {
	try {
		const response = await axios.post('/api/emergency', data);
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};

// Confirm an emergency
export const confirmEmergency = async (emergencyId: string, token: string): Promise<{ message: string }> => {
	try {
		const response = await axios.patch(`/api/emergencies/${emergencyId}/confirm`, {}, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};

// Confirm a user in an emergency
export const confirmUserInEmergency = async (emergencyId: string, userId: string, token: string): Promise<{ message: string; emergency: any }> => {
	try {
		const response = await axios.patch(`/api/emergencies/${emergencyId}/matchedUsers/${userId}/confirm`, {}, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	} catch (error) {
		throw new Error(error.message);
	}
};

