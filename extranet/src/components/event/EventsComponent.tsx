import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import { CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Event } from '../../data/Event';
import { eventsListRedesignStyles } from '../../styles/eventsListRedesign';
import API_CONFIG, { buildApiUrl } from '../../utils/apiConfig';
import EventOverviewCard from '../shared/EventOverviewCard';
import Pagination from '../shared/Pagination';
import RedesignBottomNav from '../shared/RedesignBottomNav';

interface AdminEventsListViewProps {
	events: Event[];
	isLoading: boolean;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	page: number;
	totalPages: number;
	setPage: (page: number) => void;
}

// The admin-only redesigned list (matches the new mockups: full-bleed top
// bar, rose hero card, and event cards with an Edit action). Non-admins
// still get the pre-existing layout below -- there's no mockup yet for
// what a donor's version of this screen should look like, so their view
// (and its distinct "Participate" flow on EventDetail) is left untouched.
const AdminEventsListView = ({
	events,
	isLoading,
	searchTerm,
	setSearchTerm,
	page,
	totalPages,
	setPage,
}: AdminEventsListViewProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchOpen, setSearchOpen] = useState(false);
	const {
		screen,
		topBar,
		topBarDivider,
		topBarTitle,
		searchField: searchFieldRedesign,
		content,
		hero,
		heroIcon,
		heroAddButton,
		heroTitle,
		heroSubtitle,
		emptyState: emptyStateRedesign,
	} = eventsListRedesignStyles();

	const todayLabel = new Date().toLocaleDateString(
		document.documentElement.lang === 'ar' ? 'ar' : document.documentElement.lang === 'fr' ? 'fr' : 'en',
		{ day: 'numeric', month: 'short', year: 'numeric' }
	);

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('events.list.title')}</Typography>
				<IconButton
					aria-label={t('events.list.searchPlaceholder')}
					onClick={() => setSearchOpen((prev) => !prev)}
				>
					<SearchIcon />
				</IconButton>
			</div>
			{searchOpen && (
				<div className={searchFieldRedesign}>
					<TextField
						fullWidth
						autoFocus
						placeholder={t('events.list.searchPlaceholder')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			)}

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>
						<EventIcon />
					</div>
					<IconButton
						className={heroAddButton}
						aria-label={t('admin.addEvent')}
						onClick={() => navigate('/events/create')}
					>
						<AddIcon />
					</IconButton>
					<Typography className={heroTitle}>{t('events.list.title')}</Typography>
					<Typography className={heroSubtitle}>{todayLabel}</Typography>
				</div>

				{isLoading ? (
					<div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
						<CircularProgress />
					</div>
				) : events.length > 0 ? (
					<>
						{events.map((event) => (
							<EventOverviewCard
								key={event._id}
								title={event.title}
								date={event.date}
								createdAt={event.createdAt}
								mapLink={event.mapLink}
								primaryActionLabel={t('common.edit')}
								primaryActionIcon={<EditIcon fontSize='small' />}
								onPrimaryAction={() => navigate(`/events/update/${event.reference}`)}
								onViewDetails={() => navigate(`/events/${event.reference}`)}
							/>
						))}
						<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</>
				) : (
					<div className={emptyStateRedesign}>
						{searchTerm ? t('events.list.noEventsSearch') : t('events.list.noEventsGeneral')}
					</div>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

interface DonorEventsListViewProps {
	events: Event[];
	isLoading: boolean;
	searchTerm: string;
	setSearchTerm: (value: string) => void;
	page: number;
	totalPages: number;
	setPage: (page: number) => void;
}

// The donor-facing counterpart to AdminEventsListView above -- same shell
// (top bar, rose hero, event cards, pagination), but each card's action
// takes the donor to the event detail page (where the real Participate flow
// lives) instead of the admin-only Edit action, and there's no add-event FAB.
const DonorEventsListView = ({
	events,
	isLoading,
	searchTerm,
	setSearchTerm,
	page,
	totalPages,
	setPage,
}: DonorEventsListViewProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchOpen, setSearchOpen] = useState(false);
	const {
		screen,
		topBar,
		topBarDivider,
		topBarTitle,
		searchField: searchFieldRedesign,
		content,
		hero,
		heroIcon,
		heroTitle,
		heroSubtitle,
		emptyState: emptyStateRedesign,
	} = eventsListRedesignStyles();

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('events.list.title')}</Typography>
				<IconButton
					aria-label={t('events.list.searchPlaceholder')}
					onClick={() => setSearchOpen((prev) => !prev)}
				>
					<SearchIcon />
				</IconButton>
			</div>
			{searchOpen && (
				<div className={searchFieldRedesign}>
					<TextField
						fullWidth
						autoFocus
						placeholder={t('events.list.searchPlaceholder')}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			)}

			<div className={content}>
				<div className={hero}>
					<div className={heroIcon}>
						<EventIcon />
					</div>
					<Typography className={heroTitle}>{t('events.list.title')}</Typography>
					<Typography className={heroSubtitle}>{t('events.list.subtitle')}</Typography>
				</div>

				{isLoading ? (
					<div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
						<CircularProgress />
					</div>
				) : events.length > 0 ? (
					<>
						{events.map((event) => (
							<EventOverviewCard
								key={event._id}
								title={event.title}
								date={event.date}
								createdAt={event.createdAt}
								primaryActionLabel={t('admin.viewDetails')}
								onPrimaryAction={() => navigate(`/events/${event.reference}`)}
							/>
						))}
						<Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
					</>
				) : (
					<div className={emptyStateRedesign}>
						{searchTerm ? t('events.list.noEventsSearch') : t('events.list.noEventsGeneral')}
					</div>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

const EventsComponent = () => {
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
					buildApiUrl(API_CONFIG.endpoints.events.list(page))
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

	if (isAdmin) {
		return (
			<AdminEventsListView
				events={filteredEvents || []}
				isLoading={isLoading}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				page={page}
				totalPages={totalPages}
				setPage={setPage}
			/>
		);
	}

	return (
		<DonorEventsListView
			events={filteredEvents || []}
			isLoading={isLoading}
			searchTerm={searchTerm}
			setSearchTerm={setSearchTerm}
			page={page}
			totalPages={totalPages}
			setPage={setPage}
		/>
	);
};

export default EventsComponent;
