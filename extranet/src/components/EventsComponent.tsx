import { Button, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import EventCard from './EventCard';

const useStyles = makeStyles({
	eventsContainer: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: '20px',
		justifyContent: 'center',
	},
	fallBack: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh',
	},
});

const EventsComponent = () => {
	const { eventsContainer, fallBack } = useStyles();
	const [events, setEvents] = useState([]);

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setIsLoading(true); // Set loading to true when starting to fetch
				const response = await axios.get(
					`http://localhost:3000/api/events?page=${page}`
				);
				setEvents(response.data.events);
				setTotalPages(Math.ceil(response.data.totalItems / 5));
			} catch (error) {
				console.error('Error fetching events', error);
			} finally {
				setIsLoading(false); // Reset loading to false after fetching is done
			}
		};

		fetchEvents();
	}, [page]);

	console.log('events', events);

	return (
		<div>
			{isLoading ? (
				<div className={fallBack}>
					<CircularProgress />
				</div>
			) : (
				<div className={eventsContainer}>
					{events.map((event, index) => (
						<EventCard
							key={event._id}
							event={event}
							animationDelay={`${index * 0.2}s`}
						/>
					))}
				</div>
			)}
			{/* TODO: work on list display (horizontal cards maybe) & pagination (on scroll or with btns) */}
			<div>
				<Button disabled={page === 1} onClick={() => setPage(page - 1)}>
					Previous
				</Button>
				<Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
					Next
				</Button>
			</div>
		</div>
	);
};

export default EventsComponent;
