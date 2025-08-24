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
import styled from 'styled-components';
import { useAuth } from '../../auth/AuthContext';
import { Event } from '../../data/Event';
import colors from '../../styles/colors';
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
	const { eventsList, fallBack, emptyState, pagination, searchField } =
		useStyles();
	const [events, setEvents] = useState<Event[] | null>([]);
	const [filteredEvents, setFilteredEvents] = useState<Event[] | null>([]);
	const [searchTerm, setSearchTerm] = useState('');

	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);

	const [isLoading, setIsLoading] = useState(false);

	const { isAdmin } = useAuth();

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get(
					`http://localhost:3000/api/events?page=${page}`
				);
				setEvents(response.data.events);
				setTotalPages(Math.ceil(response.data.totalItems / 5));
			} catch (error) {
				console.error('Error fetching events', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchEvents();
	}, [page]);

	// Filter events - only show generic events to admins and apply search
	useEffect(() => {
		if (events) {
			// If admin, show all events, otherwise filter out generic events
			let filtered = isAdmin
				? events
				: events.filter((event) => !event.isGeneric);

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
		}
	}, [events, isAdmin, searchTerm]);

	return (
		<EventsContainer>
			<PageHeader>
				<h1>فعالياتنا</h1>
				<p>انضم إلينا في الفعاليات المختلفة لدعم بنك الدم</p>
			</PageHeader>

			<SearchContainer>
				<TextField
					placeholder='البحث في الفعاليات...'
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
					<p>جاري تحميل الفعاليات...</p>
				</div>
			) : filteredEvents && filteredEvents.length > 0 ? (
				<>
					<div className={eventsList}>
						{filteredEvents.map((event, index) => (
							<EventCard
								key={event._id}
								event={event}
								animationDelay={`${index * 0.15}s`}
							/>
						))}
					</div>
					<div className={pagination}>
						<Button disabled={page === 1} onClick={() => setPage(page - 1)}>
							السابق
						</Button>
						<Button
							disabled={page >= totalPages}
							onClick={() => setPage(page + 1)}
						>
							التالي
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
					<h3>لا توجد فعاليات متاحة</h3>
					<p>
						{searchTerm
							? 'لم نجد أي فعاليات تطابق بحثك. جرب كلمات أخرى.'
							: 'لا توجد فعاليات متاحة حالياً. تحقق مرة أخرى لاحقاً.'}
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
							مسح البحث
						</Button>
					)}
				</div>
			)}
		</EventsContainer>
	);
};

export default EventsComponent;
