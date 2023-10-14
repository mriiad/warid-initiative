import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
	Button,
	CircularProgress,
	IconButton,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Event } from '../data/Event';

const useStyles = makeStyles({
	eventContainer: {
		position: 'relative',
		height: '100vh',
		width: '-webkit-fill-available',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	overlay: {
		position: 'relative',
		color: 'white',
		padding: 20,
		textAlign: 'center',
	},
	card: {
		backgroundColor: 'rgba(255, 255, 255, 0.8)',
		backdropFilter: 'blur(10px)',
		margin: '20px 0',
		padding: 20,
		borderRadius: 10,
		boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
		maxWidth: 500,
		width: '100%',
		maxHeight: '350px',
		overflowY: 'auto',
	},
	date: {
		marginBottom: 10,
	},
	joinButton: {
		padding: '10px 20px',
		background: '#333',
		color: 'white',
		'&:hover': {
			background: '#555',
		},
	},
	fallback: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh',
	},
	description: {
		color: 'black',
	},
	foldableContent: {
		overflow: 'hidden',
		transition: 'max-height 0.3s ease',
	},
	arrowIcon: {
		cursor: 'pointer',
	},
	foldableWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
});

const EventDetail: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();
	const [event, setEvent] = useState<Event | null>();
	const [isLoading, setIsLoading] = useState(false);

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
	}, [reference]);
	const [isFolded, setIsFolded] = useState(false);

	const {
		eventContainer,
		overlay,
		card,
		date,
		joinButton,
		fallback,
		description,
		foldableContent,
		arrowIcon,
		foldableWrapper,
	} = useStyles();

	return (
		<>
			{isLoading ? (
				<div className={fallback}>
					<CircularProgress />
				</div>
			) : (
				<div
					className={eventContainer}
					style={{
						backgroundImage: event?.image
							? `url(data:image/jpeg;base64,${event.image})`
							: `url(/event-default.png)`,
					}}
				>
					<div className={overlay}>
						<Typography>{event?.title}</Typography>
						<Typography>{event?.subtitle}</Typography>
						<div className={foldableWrapper}>
							<IconButton
								onClick={() => setIsFolded(!isFolded)}
								className={arrowIcon}
							>
								{isFolded ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
							</IconButton>
							<div
								className={foldableContent}
								style={{
									maxHeight: isFolded ? '0' : '500px',
								}}
							>
								<div className={card}>
									<Typography className={date}>
										{event?.date.split('T')[0]}
									</Typography>
									<Button className={joinButton}>
										Join the 10 other people
									</Button>
								</div>
								<div className={card}>
									<Typography className={description}>
										{event?.description}
									</Typography>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default EventDetail;
