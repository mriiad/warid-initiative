import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Button, Chip, CircularProgress, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

import React, { useState } from 'react';
import {
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../auth/AuthContext';
import { useEvent } from '../../hooks';
import colors from '../../styles/colors';
import { formatDate, formatDateForDisplay } from '../../utils/utils';
import CanDonate from '../CanDonate';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import SnackbarComponent from '../shared/SnackbarComponent';
import EventConfirmation from './EventConfirmation';
const EventContainer = styled.div`
	position: relative;
	min-height: 100vh;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20px 20px 180px 20px; /* Added 180px bottom padding */
	margin-top: 80px; /* Add margin to avoid app header overlap */
	justify-content: flex-start;
`;

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	max-width: 1200px;
	margin-bottom: 30px;
	padding: 20px 0;

	& > .backButton {
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(59, 42, 130, 0.2);
		color: ${colors.purple};
		border-radius: 50%;
		padding: 12px;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(59, 42, 130, 0.1);

		&:hover {
			background: ${colors.purple};
			color: white;
			transform: translateX(-4px);
			box-shadow: 0 6px 16px rgba(59, 42, 130, 0.2);
		}

		& svg {
			font-size: 1.5rem;
		}
	}

	& > .actionButtons {
		display: flex;
		gap: 12px;
		justify-content: center;

		& .MuiButton-root {
			background: linear-gradient(
				135deg,
				${colors.purple} 0%,
				${colors.darkPurple} 100%
			);
			color: white;
			border-radius: 25px;
			padding: 12px 32px;
			font-size: 1rem;
			font-weight: 600;
			text-transform: none;
			transition: all 0.3s ease;
			box-shadow: 0 4px 15px rgba(59, 42, 130, 0.3);
			border: 2px solid ${colors.purple};

			&:hover {
				background: linear-gradient(
					135deg,
					${colors.darkPurple} 0%,
					${colors.purple} 100%
				);
				transform: translateY(-2px);
				box-shadow: 0 8px 25px rgba(59, 42, 130, 0.4);
			}

			&.deleteButton {
				background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
				border: 2px solid #dc3545;

				&:hover {
					background: linear-gradient(135deg, #b02a37 0%, #dc3545 100%);
					box-shadow: 0 8px 25px rgba(220, 53, 69, 0.4);
				}
			}
		}
	}
`;

const EventHero = styled.div`
	text-align: center;
	margin-bottom: 40px;
	max-width: 800px;
	width: 100%;
	padding: 0 20px;
	display: flex;
	flex-direction: column;
	align-items: center;

	& > .eventImage {
		width: 100%;
		max-width: 400px;
		height: 280px;
		border-radius: 24px;
		object-fit: cover;
		box-shadow: 0 20px 40px rgba(59, 42, 130, 0.2);
		margin-bottom: 30px;
		transition: transform 0.4s ease;
		border: 2px solid rgba(59, 42, 130, 0.1);

		&:hover {
			transform: scale(1.05);
			box-shadow: 0 24px 48px rgba(59, 42, 130, 0.3);
		}
	}

	& > .eventTitle {
		font-size: 2.5rem;
		font-weight: 700;
		color: ${colors.purple};
		margin-bottom: 16px;
		text-shadow: 0 2px 4px rgba(59, 42, 130, 0.1);

		@media (max-width: 768px) {
			font-size: 2rem;
		}
	}

	& > .eventSubtitle {
		font-size: 1.3rem;
		color: ${colors.darkPurple};
		margin-bottom: 20px;
		line-height: 1.6;

		@media (max-width: 768px) {
			font-size: 1.1rem;
		}
	}

	& > .eventChip {
		background: linear-gradient(
			135deg,
			${colors.rose} 0%,
			${colors.purple} 100%
		);
		color: white;
		border-radius: 20px;
		padding: 8px 20px;
		font-weight: 600;
		font-size: 0.9rem;
		box-shadow: 0 4px 12px rgba(59, 42, 130, 0.2);
	}
`;

const ContentGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	gap: 32px;
	width: 100%;
	max-width: 1400px;
	margin-bottom: 80px;
	padding: 0 20px;
	justify-items: center;
	justify-content: center;

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
		gap: 24px;
		margin-bottom: 60px;
	}

	@media (max-width: 480px) {
		grid-template-columns: 1fr;
		gap: 20px;
		margin-bottom: 50px;
		padding: 0 15px;
	}
`;

const InfoCard = styled.div`
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 24px;
	padding: 40px;
	border: 1px solid rgba(59, 42, 130, 0.1);
	box-shadow: 0 8px 32px rgba(59, 42, 130, 0.1);
	transition: all 0.3s ease;
	width: 100%;
	max-width: 500px;
	margin: 0 auto;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 16px 48px rgba(59, 42, 130, 0.2);
	}

	& > .cardTitle {
		display: flex;
		align-items: center;
		margin-bottom: 24px;

		& > .icon {
			width: 56px;
			height: 56px;
			border-radius: 50%;
			background: linear-gradient(
				135deg,
				${colors.purple} 0%,
				${colors.darkPurple} 100%
			);
			display: flex;
			align-items: center;
			justify-content: center;
			margin-left: 20px;

			& svg {
				color: white;
				font-size: 1.8rem;
			}
		}

		& > h3 {
			color: ${colors.darkPurple};
			font-size: 1.5rem;
			font-weight: 600;
			margin: 0;
		}
	}

	& > .cardContent {
		color: ${colors.darkPurple};
		line-height: 1.7;
		font-size: 1.1rem;

		& > a {
			color: ${colors.rose};
			text-decoration: none;
			font-weight: 600;
			transition: color 0.3s ease;
			font-size: 1.1rem;

			&:hover {
				color: ${colors.purple};
			}

			& svg {
				margin-left: 6px;
				font-size: 1.1rem;
			}
		}
	}

	@media (max-width: 768px) {
		padding: 32px 24px;
		max-width: 100%;

		& > .cardTitle {
			& > h3 {
				font-size: 1.3rem;
			}

			& > .icon {
				width: 48px;
				height: 48px;

				& svg {
					font-size: 1.5rem;
				}
			}
		}

		& > .cardContent {
			font-size: 1rem;

			& > a {
				font-size: 1rem;
			}
		}
	}
`;

const DescriptionCard = styled.div`
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 24px;
	padding: 40px;
	border: 1px solid rgba(59, 42, 130, 0.1);
	box-shadow: 0 8px 32px rgba(59, 42, 130, 0.1);
	grid-column: 1 / -1;
	width: 100%;
	max-width: 1000px;
	margin: 0 auto;

	& > .descriptionText {
		color: ${colors.darkPurple};
		font-size: 1.2rem;
		line-height: 1.8;
		text-align: justify;
		margin: 0;
	}

	@media (max-width: 768px) {
		padding: 32px 24px;
		max-width: 100%;

		& > .descriptionText {
			font-size: 1.1rem;
		}
	}
`;

const QRCodeCard = styled.div`
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 24px;
	padding: 40px;
	border: 1px solid rgba(59, 42, 130, 0.1);
	box-shadow: 0 8px 32px rgba(59, 42, 130, 0.1);
	text-align: center;
	grid-column: 1 / -1;
	width: 100%;
	max-width: 600px;
	margin: 0 auto;

	& > .qrTitle {
		color: ${colors.darkPurple};
		font-size: 1.4rem;
		font-weight: 600;
		margin-bottom: 24px;
	}

	& > .qrImage {
		max-width: 240px;
		max-height: 240px;
		border-radius: 20px;
		box-shadow: 0 8px 24px rgba(59, 42, 130, 0.2);
		margin: 24px 0;
	}

	@media (max-width: 768px) {
		padding: 32px 24px;
		max-width: 100%;

		& > .qrTitle {
			font-size: 1.2rem;
		}

		& > .qrImage {
			max-width: 200px;
			max-height: 200px;
		}
	}
`;

const ActionButton = styled(Button)`
	padding: 18px 48px;
	border-radius: 30px;
	font-size: 1.3rem;
	font-weight: 600;
	text-transform: none;
	background: linear-gradient(
		135deg,
		${colors.purple} 0%,
		${colors.darkPurple} 100%
	);
	color: white;
	border: 2px solid ${colors.purple};
	box-shadow: 0 8px 25px rgba(59, 42, 130, 0.3);
	transition: all 0.3s ease;
	margin: 60px auto 160px auto; /* Increased bottom margin to prevent navbar overlap */
	display: block;
	width: fit-content;
	min-width: 200px;

	&:hover {
		background: linear-gradient(
			135deg,
			${colors.darkPurple} 0%,
			${colors.purple} 100%
		);
		transform: translateY(-3px);
		box-shadow: 0 12px 35px rgba(59, 42, 130, 0.4);
	}

	&:disabled {
		background: #ccc;
		color: #666;
		transform: none;
		box-shadow: none;
	}

	@media (max-width: 768px) {
		padding: 16px 36px;
		font-size: 1.2rem;
		margin: 50px auto 140px auto;
		min-width: 180px;
	}

	@media (max-width: 480px) {
		padding: 14px 32px;
		font-size: 1.1rem;
		margin: 40px auto 120px auto;
		min-width: 160px;
	}
`;

const LoadingContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	min-height: 60vh;
	color: ${colors.purple};
	width: 100%;
	padding: 0 20px;

	& > .loadingText {
		margin-top: 20px;
		font-size: 1.2rem;
		font-weight: 500;
		text-align: center;
	}
`;

const useStyles = makeStyles({
	fallback: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100vh',
	},
	qrCodeContainer: {
		width: '100%',
		maxWidth: '600px',
		margin: '40px auto 0 auto',
	},
	qrCodeCard: {
		background: 'rgba(255, 255, 255, 0.95)',
		backdropFilter: 'blur(20px)',
		borderRadius: '24px',
		padding: '40px',
		border: '1px solid rgba(59, 42, 130, 0.1)',
		boxShadow: '0 8px 32px rgba(59, 42, 130, 0.1)',
		textAlign: 'center',
	},
	qrCodeImage: {
		maxWidth: '240px',
		maxHeight: '240px',
		borderRadius: '20px',
		boxShadow: '0 8px 24px rgba(59, 42, 130, 0.2)',
		margin: '24px 0',
	},
	qrCodeTitle: {
		color: '#3b2a82',
		fontSize: '1.4rem',
		fontWeight: '600',
		marginBottom: '24px',
	},
});

const EventDetail: React.FC = () => {
	const { reference } = useParams<{ reference: string }>();
	const { token, isAdmin } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const initialRoute: boolean = location.pathname === `/events/${reference}`;

	const { fallback, qrCodeContainer, qrCodeCard, qrCodeImage, qrCodeTitle } =
		useStyles();

	const { data: event, isLoading, isError } = useEvent(reference || '');

	const [isFavorited, setIsFavorited] = useState(false);

	// Confirmation dialog state
	const [confirmationDialog, setConfirmationDialog] = useState({
		open: false,
		title: '',
		message: '',
		confirmText: 'Confirm',
		cancelText: 'Cancel',
		onConfirm: () => {},
		warning: false,
	});

	const [message, setMessage] = useState<string | null>(null);

	const handleBackClick = () => {
		navigate('/events');
	};

	const handleFavorite = () => {
		setIsFavorited(!isFavorited);
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: event?.data?.title || 'Event',
				text: event?.data?.subtitle || 'Check out this event',
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(
				`${event?.data?.title} - ${event?.data?.subtitle}\n${window.location.href}`
			);
		}
	};

	const handleParticipateClick = async () => {
		if (token) {
			if (event?.data?.isGeneric) {
				// For generic events, use event reference
				navigate(`/donate?eventRef=${reference}`);
			} else {
				// For non-generic events, include both the event reference and date
				navigate(
					`/donate?eventRef=${reference}&eventDate=${formatDate(
						event?.data?.date
					)}`
				);
			}
		} else {
			// Redirect to login, after login they'll return to the event page
			navigate(`/login?redirect=/events/${reference}?participate`);
		}
	};

	const handleUpdate = () => {
		navigate(`/events/update/${reference}`);
	};

	const handleDelete = () => {
		setConfirmationDialog({
			open: true,
			title: 'Delete Event',
			message: `Are you sure you want to delete the event "${event?.data?.title}"? This action cannot be undone.`,
			confirmText: 'Delete',
			cancelText: 'Cancel',
			onConfirm: async () => {
				try {
					setConfirmationDialog({ ...confirmationDialog, open: false });

					const response = await fetch('http://localhost:3000/api/event', {
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ reference }),
					});

					if (response.ok) {
						setMessage('Event deleted successfully!');
						setTimeout(() => {
							navigate('/events');
						}, 2000);
					} else {
						const errorData = await response.json();
						throw new Error(errorData.message || 'Error deleting event');
					}
				} catch (error: any) {
					console.error('Error deleting event:', error);
					setMessage(`Error deleting event: ${error.message}`);
				}
			},
			warning: true,
		});
	};

	const handleCloseSnackbar = () => {
		setMessage(null);
	};

	const handleCloseConfirmationDialog = () => {
		setConfirmationDialog({ ...confirmationDialog, open: false });
	};

	return (
		<>
			{isLoading ? (
				<LoadingContainer>
					<CircularProgress size={60} />
					<Typography className='loadingText'>
						جاري تحميل تفاصيل الفعالية...
					</Typography>
				</LoadingContainer>
			) : (
				<EventContainer>
					{isAdmin && (
						<Header>
							<div className='actionButtons'>
								<Button onClick={handleUpdate}>Update Event</Button>
								<Button className='deleteButton' onClick={handleDelete}>
									Delete Event
								</Button>
							</div>
						</Header>
					)}

					<EventHero>
						<img
							src={
								event?.data?.image
									? `data:image/jpeg;base64,${event.data.image}`
									: '/event-default.png'
							}
							alt={event?.data?.title}
							className='eventImage'
						/>

						<Typography variant='h1' className='eventTitle'>
							{event?.data?.title}
						</Typography>

						<Typography variant='h5' className='eventSubtitle'>
							{event?.data?.subtitle}
						</Typography>
                        {isAdmin && (
						<Chip
							label={event?.data?.isGeneric ? 'فعالية خاصة' : 'فعالية عامة'}
							className='eventChip'
							icon={<EventIcon />}
						/>
						)}
					</EventHero>

					{initialRoute && (
						<ContentGrid>
							<InfoCard>
								<div className='cardTitle'>
									<h3>تاريخ الفعالية</h3>
									<div className='icon'>
										<CalendarMonthIcon />
									</div>
								</div>
								<div className='cardContent'>
									{formatDateForDisplay(event?.data?.date)}
								</div>
							</InfoCard>

							<InfoCard>
								<div className='cardTitle'>
									<h3>مكان الفعالية</h3>
									<div className='icon'>
										<LocationOnIcon />
									</div>
								</div>
								<div className='cardContent'>{event?.data?.location}</div>
							</InfoCard>

							<InfoCard>
								<div className='cardTitle'>
									<h3>الخريطة</h3>
									<div className='icon'>
										<MapIcon />
									</div>
								</div>
								<div className='cardContent'>
									<a
										href={event?.data?.mapLink}
										target='_blank'
										rel='noopener noreferrer'
									>
										فتح الخريطة
										<OpenInNewIcon />
									</a>
								</div>
							</InfoCard>

							{event?.data?.description && (
								<DescriptionCard>
									<Typography className='descriptionText'>
										{event.data.description}
									</Typography>
								</DescriptionCard>
							)}
						</ContentGrid>
					)}

					{event?.data?.event?.qrCode && (
						<div className={qrCodeContainer}>
							<div className={qrCodeCard}>
								<Typography variant='h6' className={qrCodeTitle}>
									مسح رمز الاستجابة السريعة للتبرع
								</Typography>
								<img
									src={event.data.event.qrCode}
									alt='QR Code'
									className={qrCodeImage}
								/>
							</div>
						</div>
					)}

					{initialRoute && (
						<ActionButton variant='contained' onClick={handleParticipateClick}>
							المشاركة في الفعالية
						</ActionButton>
					)}

					<Routes>
						<Route path='can-donate' element={<CanDonate />} />
						<Route path='confirmation' element={<EventConfirmation />} />
					</Routes>
				</EventContainer>
			)}
			{message && (
				<SnackbarComponent
					open={!!message}
					message={message}
					handleClose={handleCloseSnackbar}
				/>
			)}
			<ConfirmationDialog
				open={confirmationDialog.open}
				title={confirmationDialog.title}
				message={confirmationDialog.message}
				confirmText={confirmationDialog.confirmText}
				cancelText={confirmationDialog.cancelText}
				onConfirm={confirmationDialog.onConfirm}
				onCancel={handleCloseConfirmationDialog}
				warning={confirmationDialog.warning}
			/>
		</>
	);
};

export default EventDetail;
