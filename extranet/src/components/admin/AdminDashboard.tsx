import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import LogoutIcon from '@mui/icons-material/Logout';
import OpacityIcon from '@mui/icons-material/Opacity';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Button, IconButton, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth as useAuthContext } from '../../auth/AuthContext';
import { Emergency } from '../../data/Emergency';
import { Event } from '../../data/Event';
import {
	useAuth,
	useAdminStats,
	useConfirmEmergency,
	useDashboard,
	useEvents,
	useUnconfirmedEmergencies,
	useUserProfile,
} from '../../hooks';
import { dashboardRedesignStyles, statCardColors } from '../../styles/dashboardRedesign';
import EmergencyCard from '../emergency/EmergencyCard';
import EventOverviewCard from '../shared/EventOverviewCard';
import NotFoundPage from '../NotFoundPage';
import RedesignBottomNav from '../shared/RedesignBottomNav';
import SnackbarComponent from '../shared/SnackbarComponent';

// Purely decorative -- there is no gift/streak/reward concept anywhere in
// the schema or API yet (same "visual-only" treatment as the Google button
// on the auth screens). Flagged for a future PR if this needs real state.
const GIFT_WEEKDAYS = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GIFT_FILLED_COUNT = 2;

const greetingKeyForHour = (hour: number) => {
	if (hour < 12) return 'admin.greetingMorning';
	if (hour < 18) return 'admin.greetingAfternoon';
	return 'admin.greetingEvening';
};

const AdminDashboard = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isAdmin, userId, setToken, setUserId, setIsAdmin } = useAuthContext();
	const { logout } = useAuth();
	const { data: profileResponse } = useUserProfile();
	const { data: stats } = useAdminStats();
	const { data: eventsResponse } = useEvents(1);
	const { data: emergenciesResponse } = useUnconfirmedEmergencies(1);
	const { data: dashboardResponse } = useDashboard(userId as string);
	const confirmEmergency = useConfirmEmergency();

	const [carouselIndex, setCarouselIndex] = useState(0);
	const [message, setMessage] = useState<string | null>(null);

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
		giftCard,
		giftHeaderRow,
		giftIcon,
		giftTitle,
		giftDaysRow,
		giftDay,
		giftDayMarkerFilled,
		giftDayMarkerEmpty,
		sectionHeaderRow,
		seeAllLink,
		carouselTrack,
		carouselCard,
		carouselDots,
		carouselDot,
		carouselDotActive,
		historyRow,
		historyIcon,
		historyTitle,
		historyMeta,
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

	const emergencies: Emergency[] = emergenciesResponse?.data?.emergencies || [];
	const donations = dashboardResponse?.donations || [];

	if (!isAdmin) {
		return <NotFoundPage />;
	}

	const handleConfirmEmergency = (emergencyId: string) => {
		confirmEmergency.mutate(emergencyId, {
			onSuccess: () => setMessage(t('emergency.list.confirmSuccess')),
			onError: () => setMessage(t('emergency.list.confirmError')),
		});
	};

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

	// Issue #302: the 4th card used to duplicate totalDonations (same key,
	// same value, only the icon/color differed) instead of showing a
	// distinct metric.
	const statCards = [
		{ key: 'totalUsers', icon: PeopleIcon, value: stats?.totalUsers, colors: statCardColors.users },
		{ key: 'totalDonations', icon: WaterDropIcon, value: stats?.totalDonations, colors: statCardColors.donations },
		{ key: 'totalEvents', icon: EventIcon, value: stats?.totalEvents, colors: statCardColors.events },
		{ key: 'totalEmergencies', icon: HealthAndSafetyIcon, value: stats?.totalEmergencies, colors: statCardColors.emergencies },
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

				<div className={giftCard}>
					<div className={giftHeaderRow}>
						<div className={giftIcon}>
							<CardGiftcardIcon fontSize='small' />
						</div>
						<Typography className={giftTitle}>{t('admin.yourGift')}</Typography>
					</div>
					<div className={giftDaysRow}>
						{GIFT_WEEKDAYS.map((day, index) => (
							<div className={giftDay} key={day}>
								<span>{t(`admin.weekday.${day}`, day).charAt(0)}</span>
								{index < GIFT_FILLED_COUNT ? (
									<span className={giftDayMarkerFilled}>⭐</span>
								) : (
									<span className={giftDayMarkerEmpty} />
								)}
							</div>
						))}
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

				<div className={sectionHeaderRow}>
					<Typography className={sectionTitle} style={{ marginBottom: 0 }}>
						{t('admin.emergencySectionTitle')}
					</Typography>
					<Button type='button' className={seeAllLink} onClick={() => navigate('/emergencies')}>
						{t('admin.seeAll')}
					</Button>
				</div>
				{emergencies.length === 0 ? (
					<div className={emptyState} style={{ marginBottom: '28px' }}>
						{t('admin.noActiveEmergencies')}
					</div>
				) : (
					<>
						<div
							className={carouselTrack}
							onScroll={(e) => {
								const el = e.currentTarget;
								const index = Math.round(el.scrollLeft / el.clientWidth);
								setCarouselIndex(index);
							}}
						>
							{emergencies.map((emergency) => (
								<div className={carouselCard} key={emergency._id}>
									<EmergencyCard
										emergency={emergency}
										onConfirm={() => handleConfirmEmergency(emergency._id)}
										isConfirming={
											confirmEmergency.isPending &&
											confirmEmergency.variables === emergency._id
										}
									/>
								</div>
							))}
						</div>
						{emergencies.length > 1 && (
							<div className={carouselDots}>
								{emergencies.map((emergency, index) => (
									<span
										key={emergency._id}
										className={
											index === carouselIndex ? carouselDotActive : carouselDot
										}
									/>
								))}
							</div>
						)}
					</>
				)}

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

				<Typography className={sectionTitle}>{t('admin.donationHistory')}</Typography>
				{donations.length === 0 ? (
					<div className={emptyState}>{t('admin.noDonationHistory')}</div>
				) : (
					donations.map((donation) => (
						<div className={historyRow} key={donation.id}>
							<div className={historyIcon}>
								<OpacityIcon fontSize='small' />
							</div>
							<div>
								<Typography className={historyTitle}>{donation.event}</Typography>
								<Typography className={historyMeta}>
									{donation.date} · {donation.type}
								</Typography>
							</div>
						</div>
					))
				)}
			</div>

			<RedesignBottomNav />

			<SnackbarComponent
				open={!!message}
				message={message || ''}
				handleClose={() => setMessage(null)}
			/>
		</div>
	);
};

export default AdminDashboard;
