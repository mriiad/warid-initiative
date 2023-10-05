import { Card, CardContent, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import colors from '../styles/colors';

interface Event {
	_id: string;
	title: string;
	image: string;
	subtitle: string;
	location: string;
	date: string;
	mapLink: string;
}

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
		'&.MuiCard-root': {
			borderRadius: '32px',
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
			bottom: '64px',
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
		},
	},
	link: {
		color: 'white',
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
	} = useStyles();

	return (
		<Card className={cardContainer} style={{ animationDelay: animationDelay }}>
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
				<Typography variant='body2'>{event.subtitle}</Typography>
				<Typography variant='body2'>Location: {event.location}</Typography>
				<Typography variant='body2'>
					Date: {new Date(event.date).toLocaleDateString()}
				</Typography>
				<Typography variant='body2'>
					Map:{' '}
					<a
						href={event.mapLink}
						target='_blank'
						rel='noopener noreferrer'
						className={link}
					>
						Link
					</a>
				</Typography>
			</CardContent>
		</Card>
	);
};

export default EventCard;
