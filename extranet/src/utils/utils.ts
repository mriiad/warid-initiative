import { format } from 'date-fns';

export const extractLatLng = (
	url: string
): { latitude: number; longitude: number } => {
	const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),/;
	const match = url.match(regex);

	if (match) {
		return {
			latitude: parseFloat(match[1]),
			longitude: parseFloat(match[2]),
		};
	} else {
		return null;
	}
};

export const formatDate = (dateString) => {
	if (!dateString) return '';
	return format(new Date(dateString), 'yyyy-MM-dd');
};
