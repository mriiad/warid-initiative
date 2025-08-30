import ApartmentIcon from '@mui/icons-material/Apartment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MapIcon from '@mui/icons-material/Map';
import ShareIcon from '@mui/icons-material/Share';
import { Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Event } from '../../data/Event';
import colors from '../../styles/colors';
import { formatDateForDisplay } from '../../utils/utils';
import ActionButton from '../shared/ActionButton';
import { is } from 'date-fns/locale';

interface EventCardProps {
	event: Event;
	animationDelay: string;
	onUpdate?: (reference: string) => void;
	onDelete?: (reference: string, title: string) => void;
}

const useStyles = makeStyles({
	cardContainer: {
		background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)`,
		backdropFilter: 'blur(20px)',
		color: colors.darkPurple,
		width: '100%',
		maxWidth: '400px',
		minHeight: '500px',
		borderRadius: '24px',
		overflow: 'hidden',
		transform: 'translateY(50px)',
		opacity: 0,
		animation: '$slideUp 0.8s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		cursor: 'pointer',
		transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		border: `1px solid rgba(59, 42, 130, 0.1)`,
		boxShadow: '0 8px 32px rgba(59, 42, 130, 0.1)',
		position: 'relative',
		'&:hover': {
			transform: 'translateY(-8px) scale(1.02)',
			boxShadow: '0 20px 40px rgba(59, 42, 130, 0.2)',
			border: `1px solid ${colors.purple}30`,
			'& .cardImage': {
				transform: 'scale(1.1)',
			},
			'& .cardActions': {
				opacity: 1,
				transform: 'translateY(0)',
			},
		},
		'&.MuiCard-root': {
			borderRadius: '24px',
		},
	},
	'@keyframes slideUp': {
		'0%': {
			transform: 'translateY(50px)',
			opacity: 0,
		},
		'100%': {
			transform: 'translateY(0)',
			opacity: 1,
		},
	},
	titleContainer: {
		padding: '20px 24px 16px',
		background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.darkPurple} 100%)`,
		textAlign: 'center',
		color: 'white',
		position: 'relative',
		'& > p': {
			fontSize: '1.2rem',
			fontWeight: 600,
			margin: 0,
			textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
		},
		'&::before': {
			content: '""',
			position: 'absolute',
			bottom: '-10px',
			left: '50%',
			transform: 'translateX(-50%)',
			width: 0,
			height: 0,
			borderLeft: '10px solid transparent',
			borderRight: '10px solid transparent',
			borderTop: `10px solid ${colors.darkPurple}`,
		},
		'@media (max-width:600px)': {
			padding: '16px 20px 12px',
			'& > p': {
				fontSize: '1rem',
			},
		},
		'&.generic': {
			background: `linear-gradient(135deg, ${colors.rose} 0%, ${colors.purple} 100%)`,
			'&::before': {
				borderTop: `10px solid ${colors.purple}`,
			},
		},
	},
	imageContainer: {
		padding: '0 20px',
		position: 'relative',
		background: `linear-gradient(135deg, rgba(59, 42, 130, 0.1) 0%, rgba(255, 48, 103, 0.1) 100%)`,
	},
	image: {
		width: '100%',
		height: '280px',
		objectFit: 'cover',
		borderRadius: '16px',
		transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
		boxShadow: '0 8px 24px rgba(59, 42, 130, 0.15)',
		'@media (max-width:600px)': {
			height: '200px',
		},
	},
	contentContainer: {
		padding: '32px 24px 24px',
		background: 'white',
		position: 'relative',
		'&.MuiCardContent-root': {
			padding: '32px 24px 24px',
		},
		'@media (max-width:600px)': {
			padding: '24px 16px 20px',
			'&.MuiCardContent-root': {
				padding: '24px 16px 20px',
			},
		},
	},
	eventInfo: {
		width: '100%',
		'& > .subtitle': {
			fontSize: '1.1rem',
			fontWeight: 500,
			color: colors.purple,
			marginBottom: '16px',
			lineHeight: '1.4',
		},
	},
	infoRow: {
		display: 'flex',
		alignItems: 'center',
		marginBottom: '12px',
		padding: '12px 16px',
		background: 'rgba(59, 42, 130, 0.05)',
		borderRadius: '12px',
		border: '1px solid rgba(59, 42, 130, 0.1)',
		transition: 'all 0.3s ease',
		'&:hover': {
			background: 'rgba(59, 42, 130, 0.1)',
			transform: 'translateX(4px)',
		},
		'& > svg': {
			color: colors.purple,
			marginLeft: '12px',
			fontSize: '1.3rem',
		},
		'& > span': {
			fontSize: '0.95rem',
			color: colors.darkPurple,
			fontWeight: 500,
		},
		'& > a': {
			fontSize: '0.95rem',
			color: colors.rose,
			fontWeight: 500,
			textDecoration: 'none',
			transition: 'color 0.3s ease',
			'&:hover': {
				color: colors.purple,
			},
		},
	},
	chipContainer: {
		marginTop: '20px',
		'& > .MuiChip-root': {
			background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.darkPurple} 100%)`,
			color: 'white',
			fontWeight: 600,
			borderRadius: '20px',
			'& .MuiChip-icon': {
				color: colors.rose,
			},
		},
	},
	actions: {
		position: 'absolute',
		top: '16px',
		right: '16px',
		display: 'flex',
		gap: '8px',
		opacity: 0,
		transform: 'translateY(-10px)',
		transition: 'all 0.3s ease',
		'& .MuiIconButton-root': {
			backgroundColor: 'rgba(255, 255, 255, 0.9)',
			backdropFilter: 'blur(10px)',
			border: '1px solid rgba(59, 42, 130, 0.2)',
			'&:hover': {
				backgroundColor: colors.rose,
				'& svg': {
					color: 'white',
				},
			},
			'& svg': {
				color: colors.purple,
				fontSize: '1.2rem',
			},
		},
	},
});

const EventCard: React.FC<EventCardProps> = ({
	event,
	animationDelay,
	onUpdate,
	onDelete,
}) => {
	const {
		cardContainer,
		titleContainer,
		imageContainer,
		image,
		contentContainer,
		eventInfo,
		infoRow,
		chipContainer,
		actions,
	} = useStyles();

	const navigate = useNavigate();
	const [isFavorited, setIsFavorited] = useState(false);
	const { isAdmin } = useAuth();

	const handleClick = () => {
		navigate(`/events/${event.reference}`);
	};

	const handleFavorite = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsFavorited(!isFavorited);
	};

	const handleShare = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (navigator.share) {
			navigator.share({
				title: event.title,
				text: event.subtitle,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(`${event.title} - ${event.subtitle}`);
		}
	};

	const isGenericEvent = event.isGeneric === true;

	return (
		<Card
			className={cardContainer}
			style={{ animationDelay: animationDelay }}
			onClick={handleClick}
		>
			<div className={actions}>
				<IconButton size='small' onClick={handleFavorite}>
					<FavoriteIcon
						style={{ color: isFavorited ? colors.rose : 'inherit' }}
					/>
				</IconButton>
				<IconButton size='small' onClick={handleShare}>
					<ShareIcon />
				</IconButton>
			</div>

			<div className={`${titleContainer} ${isGenericEvent ? 'generic' : ''}`}>
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
					className={`${image} cardImage`}
				/>
			</div>

			<CardContent className={contentContainer}>
				<div className={eventInfo}>
					<Typography className='subtitle'>{event.subtitle}</Typography>

					<div className={infoRow}>
						<CalendarMonthIcon />
						<span>{formatDateForDisplay(event.date)}</span>
					</div>

					<div className={infoRow}>
						<ApartmentIcon />
						<span>{event.location}</span>
					</div>

					<div className={infoRow}>
						<MapIcon />
						<a
							href={event.mapLink}
							target='_blank'
							rel='noopener noreferrer'
							onClick={(e) => e.stopPropagation()}
						>
							خريطة الطريق
						</a>
					</div>
                    { isAdmin && (
					<div className={chipContainer}>
						<Chip
							label={isGenericEvent ? 'فعالية خاصة' : 'فعالية عامة'}
							size='small'
							icon={<FavoriteIcon />}
						/>
					</div>
					)}
				</div>
			</CardContent>

			{isAdmin && onUpdate && onDelete && (
				<div
					style={{
						padding: '16px 24px',
						display: 'flex',
						justifyContent: 'space-around',
						alignItems: 'center',
						gap: '12px',
						borderTop: '1px solid rgba(59, 42, 130, 0.1)',
						background: 'rgba(59, 42, 130, 0.02)',
					}}
				>
					<ActionButton
						title='تحديث'
						onClick={(e) => {
							e.stopPropagation();
							onUpdate(event.reference);
						}}
					/>
					<ActionButton
						title='حذف'
						onClick={(e) => {
							e.stopPropagation();
							onDelete(event.reference, event.title);
						}}
					/>
				</div>
			)}
		</Card>
	);
};

export default EventCard;
