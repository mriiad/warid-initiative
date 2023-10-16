import { Event } from '../data/Event';

const EventConfirmation: React.FC<Event> = (event: Event) => {
	return (
		<div>
			<h1>Event Confirmation for {event.title}</h1>
		</div>
	);
};

export default EventConfirmation;
