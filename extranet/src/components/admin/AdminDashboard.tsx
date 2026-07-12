import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { IconButton, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../../auth/AuthContext';
import { Event } from '../../data/Event';
import { useAuth, useAdminStats, useEvents, useUserProfile } from '../../hooks';
import { dashboardRedesignStyles, statCardColors } from '../../styles/dashboardRedesign';
import EventOverviewCard from '../shared/EventOverviewCard';
import NotFoundPage from '../NotFoundPage';
import RedesignBottomNav from '../shared/RedesignBottomNav';

const greetingKeyForHour = (hour: number) => {
	if (hour < 12) return 'admin.greetingMorning';
	if (hour < 18) return 'admin.greetingAfternoon';
	return 'admin.greetingEvening';
};

const AdminDashboard = () => {
	const { t } = useTranslation();
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
		emptyState,
	} = dashboardRedesignStyles();

	const firstName: string | undefined = profileResponse?.data?.firstname;
	const greetingKey = useMemo(() => greetingKeyForHour(new Date().getHours()), []);

	const nextEvent: Event | undefined = useMemo(() => {
		const events: Event[] = eventsResponse?.data?.events || [];
		const now = new Date();
		const upcoming = events
			.filter((event) => new Date(event.date).getTime() >= now.setHours(0, 0, 0, 0))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
		return upcoming[0];
	}, [eventsResponse]);

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
				{!nextEvent ? (
					<div className={emptyState}>{t('admin.noUpcomingEvents')}</div>
				) : (
					<EventOverviewCard
						title={nextEvent.title}
						date={nextEvent.date}
						createdAt={nextEvent.createdAt}
						mapLink={nextEvent.mapLink}
						primaryActionLabel={t('common.edit')}
						primaryActionIcon={<EditIcon fontSize='small' />}
						onPrimaryAction={() => navigate(`/events/update/${nextEvent.reference}`)}
						onViewDetails={() => navigate(`/events/${nextEvent.reference}`)}
					/>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default AdminDashboard;
