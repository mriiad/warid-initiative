import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import { CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Event } from '@/types';
import { eventsService } from '../../services';
import { eventsListRedesignStyles } from '../../styles/eventsListRedesign';
import EventOverviewCard from '../shared/EventOverviewCard';
import Pagination from '../shared/Pagination';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import { useShortDate } from '../../hooks';

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

	const shortDate = useShortDate();
	const todayLabel = shortDate(new Date());

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
				// Donors see only upcoming, non-generic events, and the server
				// now applies both -- so this page and its totalItems describe
				// the same set. That filtering used to happen here, on whatever
				// the endpoint returned for the requested page, with totalPages
				// derived from what survived; since a page holds at most five
				// items, that count could never exceed one, the pager never
				// rendered, and every event past the first page was
				// unreachable. See issue #417.
				const response = await eventsService.getAll(
					page,
					isAdmin ? {} : { upcoming: true, includeGeneric: false }
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
		// isAdmin is a plain boolean from context (stable by value, not
		// identity), so this only re-runs on an actual admin-status change --
		// exactly when the filters above change too.
	}, [page, isAdmin]);

	// The generic/past filtering and the date sort both moved to the server
	// (issue #417), so all that's left here is the search box, which has
	// always narrowed the page already on screen rather than querying.
	useEffect(() => {
		if (events) {
			let filtered = events;

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
	}, [events, searchTerm]);

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
