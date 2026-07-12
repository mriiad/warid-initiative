import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import {
	Button,
	CircularProgress,
	InputAdornment,
	TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../auth/AuthContext';
import { Event } from '../../data/Event';
import colors from '../../styles/colors';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import SnackbarComponent from '../shared/SnackbarComponent';
import EventCard from './EventCard';

const EventsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	min-height: 100vh;
	padding: 20px;
	background: linear-gradient(
		135deg,
		${colors.purple}05 0%,
		${colors.rose}05 50%,
		${colors.purple}05 100%
	);
`;

const PageHeader = styled.div`
	text-align: center;
	margin-bottom: 40px;
	padding: 20px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 20px;
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	box-shadow: 0 8px 32px rgba(59, 42, 130, 0.1);

	& > h1 {
		color: ${colors.purple};
		font-size: 2.5rem;
		margin-bottom: 10px;
		font-weight: 600;
		text-shadow: 0 2px 4px rgba(59, 42, 130, 0.1);
	}

	& > p {
		color: ${colors.darkPurple};
		font-size: 1.1rem;
		margin: 0;
	}
`;

const SearchContainer = styled.div`
	display: flex;
	gap: 20px;
	margin-bottom: 40px;
	width: 100%;
	max-width: 800px;
	justify-content: center;
	align-items: center;

	& > div {
		flex: 1;
		max-width: 400px;
	}
`;

const useStyles = makeStyles({
	eventsList: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
		gap: '32px',
		justifyContent: 'center',
		width: '100%',
		maxWidth: '1400px',
		marginBottom: '40px',
		'@media (max-width: 768px)': {
			gridTemplateColumns: '1fr',
			gap: '24px',
		},
		'@media (max-width: 480px)': {
			gridTemplateColumns: '1fr',
			gap: '20px',
		},
	},
	fallBack: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '60vh',
		color: colors.purple,
		'& > p': {
			marginTop: '20px',
			fontSize: '1.2rem',
			fontWeight: 500,
		},
	},
	emptyState: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '50vh',
		color: colors.purple,
		textAlign: 'center',
		'& > h3': {
			marginBottom: '20px',
			fontSize: '2rem',
		},
		'& > p': {
			fontSize: '1.1rem',
			marginBottom: '30px',
		},
	},
	pagination: {
		display: 'flex',
		gap: '20px',
		marginBottom: '64px',
		'& .MuiButton-root': {
			padding: '12px 32px',
			borderRadius: '25px',
			fontSize: '1.1rem',
			fontWeight: 600,
			textTransform: 'none',
			background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.darkPurple} 100%)`,
			color: 'white',
			border: `2px solid ${colors.purple}`,
			boxShadow: '0 4px 15px rgba(59, 42, 130, 0.2)',
			transition: 'all 0.3s ease',
			'&:hover': {
				background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.purple} 100%)`,
				transform: 'translateY(-2px)',
				boxShadow: '0 6px 20px rgba(59, 42, 130, 0.3)',
			},
			'&:disabled': {
				background: '#ccc',
				color: '#666',
				transform: 'none',
				boxShadow: 'none',
			},
		},
	},
	searchField: {
		'& .MuiOutlinedInput-root': {
			borderRadius: '25px',
			backgroundColor: 'rgba(255, 255, 255, 0.9)',
			backdropFilter: 'blur(10px)',
			border: `2px solid ${colors.purple}20`,
			transition: 'all 0.3s ease',
			'& fieldset': {
				border: 'none',
			},
			'&:hover': {
				border: `2px solid ${colors.purple}40`,
				boxShadow: '0 4px 15px rgba(59, 42, 130, 0.1)',
			},
			'&.Mui-focused': {
				border: `2px solid ${colors.purple}`,
				boxShadow: '0 4px 15px rgba(59, 42, 130, 0.2)',
			},
		},
		'& .MuiOutlinedInput-input': {
			color: colors.darkPurple,
			fontSize: '1rem',
			padding: '14px 20px',
		},
		'& .MuiInputAdornment-root .MuiSvgIcon-root': {
			color: colors.purple,
		},
	},
});

const EventsComponent = () => {
	const { t } = useTranslation();
	const { eventsList, fallBack, emptyState, pagination, searchField } =
		useStyles();
	const [events, setEvents] = useState<Event[] | null>([]);
	const [filteredEvents, setFilteredEvents] = useState<Event[] | null>([]);
	const [searchTerm, setSearchTerm] = useState('');

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);

	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();
	const { isAdmin, token } = useAuth();

	// Confirmation dialog state
	const [confirmationDialog, setConfirmationDialog] = useState({
		open: false,
		title: '',
		message: '',
		confirmText: 'Confirm',
		cancelText: 'Cancel',
		onConfirm: () => { },
		warning: false,
	});

	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`http://localhost:3000/api/events?page=${page}`
				);
				setEvents(response.data.events);
				if (isAdmin) {
					setTotalPages(Math.ceil(response.data.totalItems / 5));
				}
			} catch (error) {
				console.error('Error fetching events', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEvents();
	}, [page]);

	// Filter events - only show generic eventsto admins and apply search
	useEffect(() => {
		if (events) {
			// If admin, show all events, otherwise filter out generic events and old events
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			let filtered = isAdmin
				? events
				: events
					.filter((event) => !event.isGeneric)
					.filter((event) => {
						const eventDate = new Date(event.date);
						eventDate.setHours(0, 0, 0, 0); // normalize event date
						return eventDate >= today;
					}); // only future events for normal users

			// Sort by date ascending (soonest first)
			filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

			// Apply search filter
			if (searchTerm) {
				filtered = filtered.filter(
					(event) =>
						event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						event.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
						event.location.toLowerCase().includes(searchTerm.toLowerCase())
				);
			}

			setFilteredEvents(filtered);
			if (!isAdmin) {
            setTotalPages(Math.ceil(filtered.length / 5));
        }
		}
	}, [events, isAdmin, searchTerm]);

	const handleUpdate = (reference: string) => {
		console.log(`Updating event with reference ${reference}`);
		navigate(`/events/update/${reference}`);
	};

	const handleDelete = async (reference: string, title: string) => {
		console.log(`Deleting event with title ${title}`);
		setConfirmationDialog({
			open: true,
			title: 'Delete Event',
			message: `Are you sure you want to delete the event "${title}"? This action cannot be undone.`,
			confirmText: 'Delete',
			cancelText: 'Cancel',
			onConfirm: async () => {
				try {
					setIsLoading(true);
					setConfirmationDialog({ ...confirmationDialog, open: false });

					const response = await axios.delete(
						`http://localhost:3000/api/event`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
							data: { reference },
						}
					);

					if (response.status === 200) {
						setEvents(
							(prevEvents) =>
								prevEvents?.filter((event) => event.reference !== reference) ||
								[]
						);
						setMessage(t('events.list.deleteSuccess'));
					}
				} catch (error) {
					console.error('Error deleting event:', error);
					setMessage(
						t('events.list.deleteError', {
							message: error.response?.data?.message || error.message,
						})
					);
				} finally {
					setIsLoading(false);
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
		<EventsContainer>
			<PageHeader>
				<h1>{t('events.list.title')}</h1>
				<p>{t('events.list.subtitle')}</p>
			</PageHeader>

			<SearchContainer>
				<TextField
					placeholder={t('events.list.searchPlaceholder')}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className={searchField}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<SearchIcon />
							</InputAdornment>
						),
					}}
					variant='outlined'
					fullWidth
				/>
			</SearchContainer>

			{isLoading ? (
				<div className={fallBack}>
					<CircularProgress size={60} />
					<p>{t('events.list.loading')}</p>
				</div>
			) : filteredEvents && filteredEvents.length > 0 ? (
				<>
					<div className={eventsList}>
						{filteredEvents.map((event, index) => (
							<EventCard
								key={event._id}
								event={event}
								animationDelay={`${index * 0.15}s`}
								onUpdate={handleUpdate}
								onDelete={handleDelete}
							/>
						))}
					</div>
					<div className={pagination}>
						<Button disabled={page === 1} onClick={() => setPage(page - 1)}>
							{t('common.previous')}
						</Button>
						<Button
							disabled={page >= totalPages}
							onClick={() => setPage(page + 1)}
						>
							{t('common.next')}
						</Button>
					</div>
				</>
			) : (
				<div className={emptyState}>
					<EventIcon
						style={{
							fontSize: '4rem',
							color: colors.purple,
							marginBottom: '20px',
						}}
					/>
					<h3>{t('events.list.noEventsTitle')}</h3>
					<p>
						{searchTerm
							? t('events.list.noEventsSearch')
							: t('events.list.noEventsGeneral')}
					</p>
					{searchTerm && (
						<Button
							variant='contained'
							onClick={() => setSearchTerm('')}
							sx={{
								background: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.darkPurple} 100%)`,
								borderRadius: '25px',
								padding: '10px 30px',
							}}
						>
							{t('events.list.clearSearch')}
						</Button>
					)}
				</div>
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
		</EventsContainer>
	);
};

export default EventsComponent;
