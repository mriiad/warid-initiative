import ApartmentIcon from '@mui/icons-material/Apartment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MapIcon from '@mui/icons-material/Map';
import { Card, CardContent, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../data/Event';
import colors from '../../styles/colors';

interface EventCardProps {
	event: Event;
	animationDelay: string;
}

const useStyles = makeStyles({
	cardContainer: {
		backgroundColor: 'rgba(0,0,0,0.7)',
		color: 'white',
		width: '370px',
		height: '550px',
		overflow: 'hidden',
		transform: 'translateX(100%)',
		opacity: 0,
		animation: '$slideIn 0.5s forwards ease-out',
		marginBottom: '20px',
		cursor: 'pointer',
		'&.MuiCard-root': {
			borderRadius: '32px',
			boxShadow: '1px 1px 20px -2px rgb(135 108 108 / 24%)',
		},
		'@media (max-width:600px)': {
			width: '280px',
			height: '450px',
		},
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
	titleContainer: {
		padding: '10px',
		backgroundColor: '#ff306714',
		borderBottom: `4px solid ${colors.rose}`,
		textAlign: 'center',
		color: colors.darkPurple,
		fontSize: '1rem',
		'& > p': {
			fontWeight: 500,
		},
		'@media (max-width:600px)': {
			fontSize: '0.9rem',
		},
	},
	imageContainer: {
		padding: '0 24px',
		backgroundColor: colors.darkPurple,
	},
	image: {
		border: `3px solid ${colors.darkPurple}`,
		width: '100%',
		height: '300px',
		objectFit: 'cover',
		position: 'relative',
		top: '24px',
		zIndex: 99,
		'@media (max-width:600px)': {
			height: '220px',
		},
	},
	contentContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		padding: '10px',
		backgroundColor: '#ff306714',
		height: '210px',
		position: 'relative',
		'&.MuiCardContent-root': {
			padding: '32px 16px 16px',
		},
		'&::before, &::after': {
			content: '""',
			position: 'absolute',
			left: 0,
			bottom: '56px',
			height: '90px',
			width: '10px',
			backgroundColor: colors.darkPurple,
		},
		'&::before': {
			borderRightWidth: '0',
		},
		'&::after': {
			right: 0,
			left: 'auto',
			borderLeftWidth: '0',
		},
		'@media (max-width:600px)': {
			'&.MuiCardContent-root': {
				padding: '24px 12px 12px',
			},
			'&::before, &::after': {
				bottom: '46px',
			},
			height: '180px',
		},
	},
	link: {
		color: 'white',
	},
	contentData: {
		height: '134px',
		width: '300px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		backgroundColor: colors.darkPurple,
		padding: '16px',
		color: 'white',
		'& > p:first-child': {
			fontSize: '1rem',
			fontWeight: 600,
			marginBottom: '10px',
		},
		'& > div': {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			'& > svg': {
				marginRight: '8px',
			},
		},
		'@media (max-width:600px)': {
			height: '105px',
			width: '230px',
			padding: '6px',
			'& > p:first-child': {
				fontSize: '0.8rem',
				marginBottom: '4px',
			},
		},
	},
});

const EventCard: React.FC<EventCardProps> = ({ event, animationDelay }) => {
	const {
		cardContainer,
		titleContainer,
		imageContainer,
		image,
		contentContainer,
		link,
		contentData,
	} = useStyles();

	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/events/${event.reference}`);
	};

	return (
		<Card
			className={cardContainer}
			style={{ animationDelay: animationDelay }}
			onClick={handleClick}
		>
			<div className={titleContainer}>
				<Typography>{event.title}</Typography>
			</div>
			<div className={imageContainer}>
				<img
					src={
						event.image
							? `data:image/jpeg;base64,${event.image}`
							: 'event-default.png'
					}
					alt={event.title}
					className={image}
				/>
			</div>
			<CardContent className={contentContainer}>
				<div className={contentData}>
					<Typography variant='body2'>{event.subtitle}</Typography>
					<div>
						<CalendarMonthIcon />
						<Typography variant='body2'>
							{new Date(event.date).toLocaleDateString()}
						</Typography>
					</div>
					<div>
						<ApartmentIcon />
						<Typography variant='body2'>{event.location}</Typography>
					</div>
					<div>
						<MapIcon />
						<Typography variant='body2'>
							<a
								href={event.mapLink}
								target='_blank'
								rel='noopener noreferrer'
								className={link}
							>
								موقع الحدث
							</a>
						</Typography>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default EventCard;
