import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { fetchEventByReference } from '../utils/queries';

const EventConfirmation: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();

	const {
		data: event,
		isLoading,
		isError,
	} = useQuery(['event', reference], () => fetchEventByReference(reference));

	if (isLoading) return <div>Loading...</div>;
	if (isError || !event) return <div>Error loading event</div>;

	{
		/* TODO: call the '/api/event/confirmPresence' route in order to confirm presence */
	}
	return (
		<div>
			<h1>Event Confirmation for</h1>
		</div>
	);
};

export default EventConfirmation;
