import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
	Button,
	CircularProgress,
	IconButton,
	Typography,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Event } from '../data/Event';
import CardComponent from './shared/CardComponent';

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
	date: {
		marginBottom: 10,
		color: 'black',
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
	title: {
		'& > p:first-child': {
			fontSize: '1.5rem',
			fontWeight: 500,
		},
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
		'& > button': {
			color: 'white',
		},
	},
	verificationContainer: {
		marginTop: '30px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		zIndex: 1000,
	},
});

const EventDetail: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();
	const [event, setEvent] = useState<Event | null>();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const [canDonate, setCanDonate] = useState<boolean | null>(null);
	const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);
	const [showVerificationCircle, setShowVerificationCircle] = useState(false);

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
		date,
		joinButton,
		fallback,
		title,
		description,
		foldableContent,
		arrowIcon,
		foldableWrapper,
		verificationContainer,
	} = useStyles();

	const handleParticipateClick = async () => {
		if (token) {
			setShowVerificationCircle(true);

			try {
				const response = await axios.get(
					'http://localhost:3000/api/donation/canDonate',
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setCanDonate(response.data.canDonate);
				setLastDonationDate(response.data.lastDonationDate);
			} catch (error) {
				console.error('Error checking donation eligibility', error);
			} finally {
				setTimeout(() => {
					setShowVerificationCircle(false);
				}, 3000);
			}
		} else navigate(`/login?redirect=/events/${reference}?participate`);
	};

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
						<div className={title}>
							<Typography>{event?.title}</Typography>
							<Typography>{event?.subtitle}</Typography>
						</div>

						{canDonate === null ? (
							<div className={foldableWrapper}>
								<IconButton
									onClick={() => setIsFolded(!isFolded)}
									className={arrowIcon}
								>
									{isFolded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
								</IconButton>
								<div
									className={foldableContent}
									style={{
										maxHeight: isFolded ? '0' : '500px',
									}}
								>
									<CardComponent>
										<Typography className={date}>
											{dayjs(event?.date).format('DD-MM-YYYY')}
										</Typography>
										<Typography className={date}>{event?.location}</Typography>
										<Button
											className={joinButton}
											onClick={handleParticipateClick}
										>
											Participate
										</Button>
									</CardComponent>
									<CardComponent>
										<Typography className={description}>
											{event?.description}
										</Typography>
									</CardComponent>
								</div>
							</div>
						) : showVerificationCircle ? (
							<div className={verificationContainer}>
								<CircularProgress />
								<Typography>Verify the possibility of donating</Typography>
							</div>
						) : canDonate ? (
							<CardComponent>
								<Typography className={date}>
									{dayjs(event?.date).format('DD-MM-YYYY')}
								</Typography>
								<Typography className={date}>{event?.location}</Typography>
								<Typography className={date}>
									Last donation date:{' '}
									{dayjs(lastDonationDate).format('DD-MM-YYYY')}
								</Typography>
								<Typography>
									Based on your last donation date, you are allowed to donate.
								</Typography>
							</CardComponent>
						) : (
							<CardComponent>
								<Typography>Sorry, you are not allowed to donate.</Typography>
							</CardComponent>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default EventDetail;
