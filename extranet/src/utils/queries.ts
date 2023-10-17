import axios from 'axios';

export const fetchEventByReference = async (reference: string) => {
	try {
		const response = await axios.get(
			`http://localhost:3000/api/events/${reference}`
		);
		return response.data.event;
	} catch (error) {
		throw new Error(error.message);
	}
};

export const fetchCanDonate = async () => {
	try {
		const response = await axios.get(
			'http://localhost:3000/api/donation/canDonate'
		);
		return response.data.canDonate;
	} catch (error) {
		throw new Error(error.message);
	}
};
