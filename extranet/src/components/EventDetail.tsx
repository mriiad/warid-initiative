import { Button, CircularProgress, Divider, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Event } from '../data/Event';
import FormContainer from './shared/FormContainer';
import Map from './shared/Map';

const useStyles = makeStyles({
	eventContainer: {
		display: 'flex',
		gap: '16px',
	},
	actionsContainer: {
		'& > div': {
			'& > div': {
				width: '300px',
			},
		},
	},
	detailContainer: {
		'& > div': {
			display: 'block',
			'& > div': {
				width: '900px',
			},
		},
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
	divider: {
		width: '900px',
		'&.MuiDivider-root': {
			borderBottom: '1px solid white',
			margin: '20px -31px 20px',
		},
	},
});

const EventDetail: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();
	const [event, setEvent] = useState<Event | null>();
	const [isLoading, setIsLoading] = useState(false);
	const {
		eventContainer,
		detailContainer,
		actionsContainer,
		divider,
		fallback,
		image,
	} = useStyles();

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
				<div className={eventContainer}>
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
					</FormContainer>
					<div>
						{token && (
							<FormContainer className={actionsContainer}>
								<Typography>10 people are attending this event</Typography>
								<Button>Join them</Button>
							</FormContainer>
						)}
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DateCalendar value={dayjs(event?.date)} disabled />
						</LocalizationProvider>
						<Map event={event} />
					</div>
				</div>
			)}
		</>
	);
};

export default EventDetail;
