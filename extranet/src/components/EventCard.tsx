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
		width: '300px',
		height: '400px',
		overflow: 'hidden',
		transform: 'translateX(100%)',
		opacity: 0,
		animation: '$slideIn 0.5s forwards ease-out',
		'&.MuiCard-root': {
			borderRadius: '32px',
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
		backgroundColor: colors.rose,
		textAlign: 'center',
		color: 'white',
		fontSize: '1rem',
		'& > p': {
			fontWeight: 500,
		},
	},
	imageContainer: {
		padding: '0 24px',
		backgroundColor: colors.darkPurple,
	},
	image: {
		border: '5px solid white',
		width: '100%',
		height: '200px',
		objectFit: 'cover',
		position: 'relative',
		top: '24px',
	},
	contentContainer: {
		padding: '10px',
		backgroundColor: colors.rose,
		height: '-webkit-fill-available',
		'&.MuiCardContent-root': {
			padding: '32px 16px 16px',
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
		<Card className={cardContainer} style={{ animationDelay }}>
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
