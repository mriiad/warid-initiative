import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import OpacityIcon from '@mui/icons-material/Opacity';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useDashboard } from '../hooks';
import { authRedesignStyles } from '../styles/authRedesign';
import { dashboardRedesignStyles, statCardColors } from '../styles/dashboardRedesign';
import RedesignBottomNav from './shared/RedesignBottomNav';

export default function Dashboard() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { userId } = useAuth();
	const { data, isLoading, isError, error } = useDashboard(userId);
	const { primaryButton } = authRedesignStyles();
	const {
		screen,
		header,
		greetingTitle,
		greetingSubtitle,
		content,
		sectionTitle,
		statGrid,
		statCard,
		statIcon,
		statLabel,
		statValue,
		historyRow,
		historyIcon,
		historyTitle,
		historyMeta,
		emptyState,
	} = dashboardRedesignStyles();

	if (isLoading) {
		return (
			<div className={screen}>
				<div className={header}>
					<Typography className={greetingTitle}>{t('dashboard.loading')}</Typography>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className={screen}>
				<div className={content} style={{ marginTop: '20px' }}>
					<div className={emptyState} style={{ color: '#B3261E' }}>
						{t('dashboard.errorPrefix')} {error?.message || t('dashboard.unknownError')}
					</div>
				</div>
			</div>
		);
	}

	const stats = data?.stats ?? { total: 0, lastDonation: '-', eligibleIn: '-' };
	const donations = data?.donations ?? [];

	const statCards = [
		{ key: 'totalDonations', icon: OpacityIcon, value: stats.total, colors: statCardColors.donationsAlt },
		{ key: 'nextDonation', icon: AccessTimeIcon, value: stats.eligibleIn, colors: statCardColors.events },
		{ key: 'lastDonation', icon: CalendarMonthIcon, value: stats.lastDonation, colors: statCardColors.donations },
	];

	return (
		<div className={screen}>
			<div className={header}>
				<Typography className={greetingTitle}>{t('dashboard.welcome')}</Typography>
				<Typography className={greetingSubtitle}>{t('dashboard.welcomeMessage')}</Typography>
			</div>

			<div className={content}>
				{donations.length === 0 ? (
					<div className={emptyState} style={{ padding: '32px 20px' }}>
						<FavoriteBorderIcon style={{ color: '#8A8690', marginBottom: '10px' }} fontSize='large' />
						<div style={{ fontWeight: 700, color: '#1F1B24', marginBottom: '6px' }}>
							{t('dashboard.noDonationsTitle')}
						</div>
						<div style={{ marginBottom: '16px' }}>{t('dashboard.noDonationsBody')}</div>
						<Button
							type='button'
							className={primaryButton}
							onClick={() => navigate('/events?page=1')}
						>
							{t('dashboard.seeUpcomingEvents')}
						</Button>
					</div>
				) : (
					<>
						<div className={statGrid}>
							{statCards.map((card) => {
								const Icon = card.icon;
								return (
									<div className={statCard} key={card.key}>
										<div
											className={statIcon}
											style={{ backgroundColor: card.colors.bg, color: card.colors.fg }}
										>
											<Icon />
										</div>
										<Typography className={statLabel}>{t(`dashboard.${card.key}`)}</Typography>
										<Typography className={statValue}>{card.value}</Typography>
									</div>
								);
							})}
						</div>

						<Typography className={sectionTitle}>{t('dashboard.donationHistory')}</Typography>
						{donations.map((d) => (
							<div className={historyRow} key={d.id}>
								<div className={historyIcon}>
									<OpacityIcon fontSize='small' />
								</div>
								<div>
									<Typography className={historyTitle}>{d.event}</Typography>
									<Typography className={historyMeta}>
										{d.date} · {d.type}
									</Typography>
								</div>
							</div>
						))}
					</>
				)}
			</div>

			<RedesignBottomNav />
		</div>
	);
}
