import EventIcon from '@mui/icons-material/Event'; // For the date
import LocationOnIcon from '@mui/icons-material/LocationOn'; // For the location
import MapIcon from '@mui/icons-material/Map'; // For the mapLink
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button, CircularProgress, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Event } from '../data/Event';
import colors from '../styles/colors';
import CardComponent from './shared/CardComponent';

const useStyles = makeStyles({
	resultMessage: {
		marginTop: '20px',
		color: 'black',
	},
	confirmButton: {
		padding: '10px 20px',
		background: '#333',
		color: 'white',
		'&.MuiButtonBase-root': {
			marginTop: '10px',
			color: 'white',
			backgroundColor: colors.purple,
		},
	},
	infoCard: {
		borderRadius: '10px',
		display: 'flex',
		alignItems: 'center',
		color: '#000',
	},
	iconBox: {
		flex: '1',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '10px',
	},
	dataBox: {
		flex: '6',
		padding: '10px',
	},
	verticalDivider: {
		height: '80%',
		backgroundColor: '#cfbbbb36',
	},
});

const CanDonate: React.FC = () => {
	const [canDonate, setCanDonate] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [event, setEvent] = useState<Event | null>();
	const navigate = useNavigate();
	const { reference } = useParams<{ reference: string }>();

	const {
		resultMessage,
		confirmButton,
		infoCard,
		iconBox,
		dataBox,
		verticalDivider,
	} = useStyles();

	useEffect(() => {
		const checkCanDonate = async () => {
			setIsLoading(true);
			try {
				const response = await axios.get(
					'http://localhost:3000/api/donation/canDonate'
				);
				setCanDonate(response.data.canDonate);
			} catch (error) {
				console.error('Error checking donation eligibility', error);
			} finally {
				setTimeout(() => {
					setIsLoading(false);
				}, 3000);
			}
		};

		checkCanDonate();
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

	const handleConfirmClick = () => {
		navigate(`/events/${reference}/confirmation`);
	};

	return (
		<>
			<CardComponent>
				{isLoading ? (
					<CircularProgress />
				) : canDonate === null ? (
					<Typography className={resultMessage}>
						Unable to determine eligibility.
					</Typography>
				) : canDonate ? (
					<Typography className={resultMessage}>
						Based on your last donation date, you are allowed to donate.
					</Typography>
				) : (
					<Typography className={resultMessage}>
						Sorry, you are not allowed to donate.
					</Typography>
				)}
			</CardComponent>

			<CardComponent>
				<Box className={infoCard}>
					{/* Icon for Date */}
					<Box className={iconBox}>
						<EventIcon />
					</Box>
					<Divider
						orientation='vertical'
						flexItem
						className={verticalDivider}
					/>
					{/* Event Date */}
					<Box className={dataBox}>
						<Typography> {dayjs(event?.date).format('DD-MM-YYYY')}</Typography>
					</Box>
				</Box>
				<Box className={infoCard}>
					{/* Icon for Location */}
					<Box className={iconBox}>
						<LocationOnIcon />
					</Box>
					<Divider
						orientation='vertical'
						flexItem
						className={verticalDivider}
					/>
					{/* Event Location */}
					<Box className={dataBox}>
						<Typography>{event?.location}</Typography>
					</Box>
				</Box>
				<Box className={infoCard}>
					{/* Icon for MapLink */}
					<Box className={iconBox}>
						<MapIcon />
					</Box>
					<Divider
						orientation='vertical'
						flexItem
						className={verticalDivider}
					/>
					<Box className={dataBox}>
						<a href={event?.mapLink} target='_blank' rel='noopener noreferrer'>
							Open Map
							<OpenInNewIcon />
						</a>
					</Box>
				</Box>
			</CardComponent>

			<Button className={confirmButton} onClick={handleConfirmClick}>
				Confirm
			</Button>
		</>
	);
};

export default CanDonate;
