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
	lastDonationDate: string;
	donationType: string;
	disease: string;
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
