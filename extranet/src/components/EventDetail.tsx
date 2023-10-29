import EventIcon from '@mui/icons-material/Event';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
	Button,
	CircularProgress,
	IconButton,
	Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import colors from '../styles/colors';
import { useEventStyles } from '../styles/eventStyle';
import { fetchEventByReference } from '../utils/queries';
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
		width: '100%',
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
	const navigate = useNavigate();
	const location = useLocation();
	const initialRoute: boolean = location.pathname === `/events/${reference}`;

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

	const { infoCard, iconBox, dataBox, verticalDivider } = useEventStyles();

	const {
		data: event,
		isLoading,
		isError,
	} = useQuery(['event', reference], () => fetchEventByReference(reference));

	const [isFolded, setIsFolded] = useState(false);

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
									<Box className={infoCard}>
										<Box className={iconBox}>
											<EventIcon />
										</Box>
										<Divider
											orientation='vertical'
											flexItem
											className={verticalDivider}
										/>
										<Box className={dataBox}>
											<Typography>
												{' '}
												{dayjs(event?.date).format('DD-MM-YYYY')}
											</Typography>
										</Box>
									</Box>
									<Box className={infoCard}>
										<Box className={iconBox}>
											<LocationOnIcon />
										</Box>
										<Divider
											orientation='vertical'
											flexItem
											className={verticalDivider}
										/>
										<Box className={dataBox}>
											<Typography>{event?.location}</Typography>
										</Box>
									</Box>
									<Box className={infoCard}>
										<Box className={iconBox}>
											<MapIcon />
										</Box>
										<Divider
											orientation='vertical'
											flexItem
											className={verticalDivider}
										/>
										<Box className={dataBox}>
											<a
												href={event?.mapLink}
												target='_blank'
												rel='noopener noreferrer'
											>
												Open Map
												<OpenInNewIcon />
											</a>
										</Box>
									</Box>
								</CardComponent>
								{initialRoute && (
									<>
										{event?.description && (
											<CardComponent>
												<Typography className={description}>
													{event.description}
												</Typography>
											</CardComponent>
										)}
										<Button
											className={joinButton}
											onClick={handleParticipateClick}
										>
											Participate
										</Button>
									</>
								)}
							</div>
						</div>

						<Routes>
							<Route path='can-donate' element={<CanDonate />} />
							<Route path='confirmation' element={<EventConfirmation />} />
						</Routes>
					</div>
				</div>
			)}
		</>
	);
};

export default EventDetail;
