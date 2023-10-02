import {
	Button,
	Card,
	CardContent,
	CircularProgress,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';

const useStyles = makeStyles({
	eventsContainer: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: '20px',
		justifyContent: 'center',
	},
	eventCard: {
		backgroundSize: 'cover',
		borderRadius: '20px',
		color: '#fff',
		position: 'relative',
		overflow: 'hidden',
		marginBottom: '20px',
		transform: 'translateX(100%)',
		opacity: 0,
		animation: '$slideIn 0.5s forwards ease-out',
	},
	'@keyframes slideIn': {
		'0%': {
			transform: 'translateX(100%)',
			opacity: 0,
		},
		'100%': {
			transform: 'translateX(0)',
			opacity: 1,
		},
	},
	title: {
		fontWeight: '500',
		fontSize: 'clamp(14px, 1.3vw, 18px)',
		backgroundColor: 'rgba(0,0,0,0.7)',
		padding: '10px',
		textAlign: 'center',
	},
	content: {
		backgroundColor: 'rgba(0,0,0,0.7)',
		padding: '10px',
	},
	subTitle: {
		fontSize: 'clamp(12px, 1.2vw, 16px)',
		fontWeight: 'bold',
	},
	fallBack: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh',
	},
});

const EventsComponent = () => {
	const { eventsContainer, title, subTitle, eventCard, content, fallBack } =
		useStyles();
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
						<Card
							key={event._id}
							className={eventCard}
							style={{
								backgroundImage: `url(data:image/jpeg;base64,${event.image})`,
								animationDelay: `${index * 0.2}s`,
							}}
						>
							<CardContent>
								<Typography variant='h5' className={title}>
									{event.title}
								</Typography>
								<div className={content}>
									<Typography variant='body2' className={subTitle}>
										{event.subtitle}
									</Typography>
									<Typography variant='body2'>
										Location: {event.location}
									</Typography>
									<Typography variant='body2'>
										Date: {new Date(event.date).toLocaleDateString()}
									</Typography>
									<Typography variant='body2'>
										Map:{' '}
										<a
											href={event.mapLink}
											target='_blank'
											rel='noopener noreferrer'
										>
											Link
										</a>
									</Typography>
								</div>
							</CardContent>
						</Card>
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
