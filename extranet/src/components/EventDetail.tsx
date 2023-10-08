import {
	Button,
	CircularProgress,
	Divider,
	Link,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Event } from '../data/Event';
import FormContainer from './shared/FormContainer';

const useStyles = makeStyles({
	detailContainer: {
		width: '900px',
	},
	fallback: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh',
	},
	image: {
		width: '100%',
		border: '12px solid white',
	},
	content: {
		backgroundColor: 'rgba(255, 48, 103, 0.1)',
		padding: '20px',
		textAlign: 'center',
		width: '80%',
		marginTop: '20px',
	},
	divider: {
		width: '900px',
		'&.MuiDivider-root': {
			borderBottom: '1px solid white',
			margin: '20px -31px 20px',
		},
	},
	eventData: {
		marginTop: '20px',
		textAlign: 'center',
	},
});

const EventDetail: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();
	const [event, setEvent] = useState<Event | null>();
	const [isLoading, setIsLoading] = useState(false);
	const { detailContainer, eventData, divider, fallback, image, content } =
		useStyles();

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
				<FormContainer className={detailContainer}>
					<Typography variant='h3'>{event?.title}</Typography>
					<Divider className={divider} />

					<img
						src={
							event?.image
								? `data:image/jpeg;base64,${event.image}`
								: 'event-default.png'
						}
						alt={event?.title}
						className={image}
					/>

					<Divider className={divider} />

					<div className={eventData}>
						<Typography variant='h6'>{event?.date}</Typography>
						<Typography variant='h6'>
							<Link href={event?.mapLink} target='_blank' rel='noopener'>
								View Map
							</Link>
						</Typography>
						<Typography variant='h6'>{event?.location}</Typography>
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
					</div>
				</FormContainer>
			)}
		</>
	);
};

export default EventDetail;
