import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { IconButton, Typography } from '@mui/material';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../../auth/AuthContext';
import { useAuth, useAdminStats, useEvents, useUserProfile } from '../../hooks';
import { dashboardRedesignStyles, statCardColors } from '../../styles/dashboardRedesign';
import NotFoundPage from '../NotFoundPage';
import AdminBottomNav from './AdminBottomNav';

interface AdminEvent {
	reference: string;
	title: string;
	location: string;
	date: string;
	mapLink?: string;
	createdAt?: string;
}

const WEEKDAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const greetingKeyForHour = (hour: number) => {
	if (hour < 12) return 'admin.greetingMorning';
	if (hour < 18) return 'admin.greetingAfternoon';
	return 'admin.greetingEvening';
};

const AdminDashboard = () => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { isAdmin, setToken, setUserId, setIsAdmin } = useAuthContext();
	const { logout } = useAuth();
	const { data: profileResponse } = useUserProfile();
	const { data: stats } = useAdminStats();
	const { data: eventsResponse } = useEvents(1);

	const {
		screen,
		header,
		searchBar,
		searchInput,
		searchIconButton,
		greetingRow,
		avatar,
		greetingTitle,
		greetingSubtitle,
		content,
		sectionTitle,
		statGrid,
		statCard,
		statIcon,
		statLabel,
		statValue,
		eventCard,
		eventHeaderRow,
		eventIconBadge,
		eventTitle,
		eventDateRow,
		eventDateStart,
		eventDateEnd,
		progressTrack,
		progressFill,
		weekStrip,
		weekDay,
		weekDayNumber,
		weekDayNumberActive,
		eventActionsRow,
		editButton,
		iconSquareButton,
		iconSquareButtonNeutral,
		emptyState,
	} = dashboardRedesignStyles();

	const firstName: string | undefined = profileResponse?.data?.firstname;
	const greetingKey = useMemo(() => greetingKeyForHour(new Date().getHours()), []);

	const nextEvent: AdminEvent | undefined = useMemo(() => {
		const events: AdminEvent[] = eventsResponse?.data?.events || [];
		const now = new Date();
		const upcoming = events
			.filter((event) => new Date(event.date).getTime() >= now.setHours(0, 0, 0, 0))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		return upcoming[0];
	}, [eventsResponse]);

	const eventDate = nextEvent ? new Date(nextEvent.date) : null;
	const eventCreatedAt = nextEvent?.createdAt ? new Date(nextEvent.createdAt) : null;
	const progressPercent = useMemo(() => {
		if (!eventDate || !eventCreatedAt) return 100;
		const total = eventDate.getTime() - eventCreatedAt.getTime();
		if (total <= 0) return 100;
		const elapsed = Date.now() - eventCreatedAt.getTime();
		return Math.min(100, Math.max(0, (elapsed / total) * 100));
	}, [eventDate, eventCreatedAt]);

	const weekStripDays = useMemo(() => {
		if (!eventDate) return [];
		const monday = new Date(eventDate);
		const day = monday.getDay();
		const diffToMonday = day === 0 ? -6 : 1 - day;
		monday.setDate(monday.getDate() + diffToMonday);
		return Array.from({ length: 7 }, (_, index) => {
			const date = new Date(monday);
			date.setDate(monday.getDate() + index);
			return date;
		});
	}, [eventDate]);

	const locale = i18n.language === 'ar' ? 'ar' : i18n.language === 'fr' ? 'fr' : 'en';
	const formatDate = (date: Date) =>
		date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

	if (!isAdmin) {
		return <NotFoundPage />;
	}

	const handleLogout = () => {
		logout.mutate(undefined, {
			onSuccess: () => {
				setToken(null);
				setUserId(null);
				setIsAdmin(false);
				navigate('/login');
			},
		});
	};

	const statCards = [
		{ key: 'totalUsers', icon: PeopleIcon, value: stats?.totalUsers, colors: statCardColors.users },
		{ key: 'totalDonations', icon: WaterDropIcon, value: stats?.totalDonations, colors: statCardColors.donations },
		{ key: 'totalEvents', icon: EventIcon, value: stats?.totalEvents, colors: statCardColors.events },
		{ key: 'totalDonations', icon: BloodtypeIcon, value: stats?.totalDonations, colors: statCardColors.donationsAlt },
	];

	return (
		<div className={screen}>
			<div className={header}>
				<div className={searchBar}>
					<BloodtypeIcon fontSize='small' />
					<input
						className={searchInput}
						placeholder={t('admin.searchPlaceholder')}
						aria-label={t('admin.searchPlaceholder')}
					/>
					<IconButton className={searchIconButton} aria-label={t('admin.searchPlaceholder')}>
						<SearchIcon fontSize='small' />
					</IconButton>
					<IconButton
						className={searchIconButton}
						aria-label={t('admin.logout')}
						onClick={handleLogout}
					>
						<LogoutIcon fontSize='small' />
					</IconButton>
				</div>
				<div className={greetingRow}>
					<div className={avatar}>{(firstName || '?').charAt(0).toUpperCase()}</div>
					<div>
						<Typography className={greetingTitle}>
							{t(greetingKey, { name: firstName || '' })} 👋
						</Typography>
						<Typography className={greetingSubtitle}>
							{t('admin.greetingSubtitle')}
						</Typography>
					</div>
				</div>
			</div>

			<div className={content}>
				<Typography className={sectionTitle}>{t('admin.overview')}</Typography>
				<div className={statGrid}>
					{statCards.map((card, index) => {
						const Icon = card.icon;
						return (
							<div className={statCard} key={`${card.key}-${index}`}>
								<div
									className={statIcon}
									style={{ backgroundColor: card.colors.bg, color: card.colors.fg }}
								>
									<Icon />
								</div>
								<Typography className={statLabel}>{t(`admin.${card.key}`)}</Typography>
								<Typography className={statValue}>{card.value ?? '—'}</Typography>
							</div>
						);
					})}
				</div>

				<Typography className={sectionTitle}>{t('admin.nextEvent')}</Typography>
				{!nextEvent || !eventDate ? (
					<div className={emptyState}>{t('admin.noUpcomingEvents')}</div>
				) : (
					<div className={eventCard}>
						<div className={eventHeaderRow}>
							<div className={eventIconBadge}>
								<EventIcon fontSize='small' />
							</div>
							<Typography className={eventTitle}>{nextEvent.title}</Typography>
						</div>
						<div className={eventDateRow}>
							<span className={eventDateStart}>
								{eventCreatedAt ? `${t('admin.createdOn')} ${formatDate(eventCreatedAt)}` : ''}
							</span>
							<span className={eventDateEnd}>{formatDate(eventDate)}</span>
						</div>
						<div className={progressTrack}>
							<div className={progressFill} style={{ width: `${progressPercent}%` }} />
						</div>
						<div className={weekStrip}>
							{weekStripDays.map((date, index) => {
								const isEventDay = date.toDateString() === eventDate.toDateString();
								return (
									<div className={weekDay} key={date.toISOString()}>
										<span>{t(`admin.weekday.${WEEKDAY_KEYS[index]}`, WEEKDAY_KEYS[index])}</span>
										<span
											className={clsx(weekDayNumber, isEventDay && weekDayNumberActive)}
										>
											{date.getDate()}
										</span>
									</div>
								);
							})}
						</div>
						<div className={eventActionsRow}>
							<button
								type='button'
								className={editButton}
								onClick={() => navigate(`/events/update/${nextEvent.reference}`)}
							>
								{t('common.edit')}
								<EditIcon fontSize='small' />
							</button>
							{nextEvent.mapLink && (
								<IconButton
									className={iconSquareButton}
									aria-label={t('admin.viewLocation')}
									component='a'
									href={nextEvent.mapLink}
									target='_blank'
									rel='noopener noreferrer'
								>
									<LocationOnIcon />
								</IconButton>
							)}
							<IconButton
								className={iconSquareButtonNeutral}
								aria-label={t('admin.viewDetails')}
								onClick={() => navigate(`/events/${nextEvent.reference}`)}
							>
								<ArrowForwardIcon />
							</IconButton>
						</div>
					</div>
				)}
			</div>

			<AdminBottomNav />
		</div>
	);
};

export default AdminDashboard;
