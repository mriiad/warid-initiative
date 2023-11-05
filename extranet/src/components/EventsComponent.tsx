import { Button, CircularProgress } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Event } from '../data/Event';
import EventCard from './EventCard';

const EventsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const useStyles = makeStyles({
	eventsList: {
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
	pagination: {
		marginBottom: '64px',
	},
});

const EventsComponent = () => {
	const { eventsList, fallBack, pagination } = useStyles();
	const [events, setEvents] = useState<Event[] | null>([]);

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`http://localhost:3000/api/events?page=${page}`
				);
				setEvents(response.data.events);
				setTotalPages(Math.ceil(response.data.totalItems / 5));
			} catch (error) {
				console.error('Error fetching events', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEvents();
	}, [page]);

	return (
		<EventsContainer>
			{isLoading ? (
				<div className={fallBack}>
					<CircularProgress />
				</div>
			) : (
				<div className={eventsList}>
					{events.map((event, index) => (
						<EventCard
							key={event._id}
							event={event}
							animationDelay={`${index * 0.2}s`}
						/>
					))}
				</div>
			)}
			<div className={pagination}>
				<Button disabled={page === 1} onClick={() => setPage(page - 1)}>
					Previous
				</Button>
				<Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
					Next
				</Button>
			</div>
			<div></div>
		</EventsContainer>
	);
};

export default EventsComponent;
