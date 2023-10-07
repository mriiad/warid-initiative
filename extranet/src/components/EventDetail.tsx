import {
	Button,
	Card,
	CardContent,
	CircularProgress,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Event } from '../data/Event';

const useStyles = makeStyles({
	detailContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '20px',
		color: 'white',
		minHeight: '100vh',
		backgroundColor: 'rgba(0,0,0,0.7)',
	},
	fallback: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh',
	},
	image: {
		maxWidth: '500px',
		width: '100%',
		marginTop: '20px',
		border: '3px solid white',
	},
	content: {
		backgroundColor: 'rgba(255, 48, 103, 0.1)',
		padding: '20px',
		textAlign: 'center',
		width: '80%',
		marginTop: '20px',
	},
});

const EventDetail: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();
	const [event, setEvent] = useState<Event | null>();
	const [isLoading, setIsLoading] = useState(false);
	const { detailContainer, fallback, image, content } = useStyles();

	useEffect(() => {
		const fetchEvent = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`http://localhost:3000/api/events/${reference}`
				);
				setEvent(response.data.event);
			} catch (error) {
				console.error('Error fetching events', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEvent();
	}, []);

	return (
		<>
			{isLoading ? (
				<div className={fallback}>
					<CircularProgress />
				</div>
			) : (
				<div className={detailContainer}>
					<img
						src={
							event?.image
								? `data:image/jpeg;base64,${event.image}`
								: 'C:/Users/MCMXLIX/Projects/warid-initiative/extranet/public/event-default.png'
						}
						alt={event?.title}
						className={image}
					/>

					<Card className={content}>
						<CardContent>
							<Typography variant='h3'>{event?.title}</Typography>
							<Typography variant='h5'>{event?.subtitle}</Typography>

							{token && (
								<Button
									variant='contained'
									color='primary'
									style={{ marginTop: '20px' }}
								>
									Participate
								</Button>
							)}

							{token && isAdmin && (
								<Button
									variant='contained'
									color='secondary'
									style={{ marginTop: '10px' }}
								>
									Create Event
								</Button>
							)}
						</CardContent>
					</Card>
				</div>
			)}
		</>
	);
};

export default EventDetail;
