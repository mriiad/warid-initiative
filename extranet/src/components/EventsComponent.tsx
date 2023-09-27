import { Button, Card, CardContent, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

const useStyles = makeStyles({
	eventCard: {
		backgroundSize: 'cover',
		borderRadius: '20px',
		color: '#fff',
		position: 'relative',
		overflow: 'hidden',
		marginBottom: '20px',
		'&:hover': {
			transform: 'scale(1.05)',
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
});

const EventsComponent = () => {
	const { token } = useAuth();

	const classes = useStyles();
	const [events, setEvents] = useState([]);

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await axios.get(
					`http://localhost:3000/api/events?page=${page}`,
					{
						headers: { Authorization: 'Bearer ' + token },
					}
				);
				setEvents(response.data.events);
				setTotalPages(Math.ceil(response.data.totalItems / 5)); // Assuming 5 is the number of events per page.
			} catch (error) {
				console.error('Error fetching events', error);
			}
		};

		fetchEvents();
	}, [page, token]); // Re-fetch when page number changes.

	console.log('events', events);

	return (
		<div>
			{events.map((event) => (
				<Card
					key={event._id}
					className={classes.eventCard}
					style={{
						backgroundImage: `url(data:image/jpeg;base64,${event.image})`,
					}}
				>
					<CardContent>
						<Typography variant='h5' className={classes.title}>
							{event.title}
						</Typography>
						<div className={classes.content}>
							<Typography variant='body2' className={classes.subTitle}>
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
