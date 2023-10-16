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
import {
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Event } from '../data/Event';
import colors from '../styles/colors';
import CanDonate from './CanDonate';
import EventConfirmation from './EventConfirmation';
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
		'&.MuiButtonBase-root': {
			marginTop: '10px',
			color: 'white',
			backgroundColor: colors.purple,
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
});

const EventDetail: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();
	const [event, setEvent] = useState<Event | null>();
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const initialRoute: boolean = location.pathname === `/events/${reference}`;
	const canDonateRoute: boolean =
		location.pathname === `/events/${reference}/can-donate`;

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
	} = useStyles();

	const handleParticipateClick = async () => {
		if (token) {
			navigate(`/events/${reference}/can-donate`);
		} else {
			navigate(`/login?redirect=/events/${reference}?participate`);
		}
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

						{initialRoute && (
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
						)}

						<Routes>
							<Route path='can-donate' element={<CanDonate />} />
							<Route
								path='confirmation'
								element={event ? <EventConfirmation {...event} /> : null}
							/>
						</Routes>
					</div>
				</div>
			)}
		</>
	);
};

export default EventDetail;
