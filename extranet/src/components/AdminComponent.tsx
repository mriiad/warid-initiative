import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import PeopleIcon from '@mui/icons-material/People';
import { IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { hasAdminRole } from '../auth/adminAccess';
import { useAuth } from '../auth/AuthContext';
import { statCardColors } from '../styles/dashboardRedesign';
import { adminMenuRedesignStyles } from '../styles/adminMenuRedesign';
import NotFoundPage from './NotFoundPage';
import RedesignBottomNav from './shared/RedesignBottomNav';

const AdminComponent = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isAdmin, adminRole } = useAuth();
	// The administration page -- with its buttons for handling emergencies,
	// creating events and managing users -- is Principal-Admin-only, who
	// keeps the full navbar as it is today. See issue #183.
	const isPrincipalAdmin = hasAdminRole(isAdmin, adminRole, []);
	const {
		screen,
		topBar,
		topBarDivider,
		topBarTitle,
		content,
		tile,
		tileIcon,
		tileLabel,
	} = adminMenuRedesignStyles();

	if (!isPrincipalAdmin) {
		return <NotFoundPage />;
	}

	const tiles = [
		{
			key: 'addEvent',
			label: t('admin.addEvent'),
			icon: EventIcon,
			colors: statCardColors.users,
			action: <AddIcon fontSize='small' />,
			onClick: () => navigate('/events/create'),
		},
		{
			key: 'usersList',
			label: t('admin.usersList'),
			icon: PeopleIcon,
			colors: statCardColors.donationsAlt,
			action: <ArrowForwardIcon fontSize='small' />,
			onClick: () => navigate('/users?page=1'),
		},
		{
			key: 'emergenciesList',
			label: t('admin.emergenciesList'),
			icon: NotificationImportantIcon,
			colors: statCardColors.donations,
			action: <ArrowForwardIcon fontSize='small' />,
			onClick: () => navigate('/emergencies?page=1'),
		},
	];

	return (
		<div className={screen}>
			<div className={topBar}>
				<IconButton aria-label={t('common.back')} onClick={() => navigate(-1)}>
					<ArrowBackIcon />
				</IconButton>
				<div className={topBarDivider} />
				<Typography className={topBarTitle}>{t('nav.admin')}</Typography>
				<div style={{ width: '40px' }} />
			</div>

			<div className={content}>
				{tiles.map((item) => {
					const Icon = item.icon;
					return (
						<button
							key={item.key}
							type='button'
							className={tile}
							onClick={item.onClick}
						>
							<div
								className={tileIcon}
								style={{ backgroundColor: item.colors.bg, color: item.colors.fg }}
							>
								<Icon fontSize='small' />
							</div>
							<Typography className={tileLabel}>{item.label}</Typography>
							<span
								aria-hidden='true'
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									width: '40px',
									height: '40px',
									backgroundColor: '#F1EFF4',
									borderRadius: '12px',
									flexShrink: 0,
								}}
							>
								{item.action}
							</span>
						</button>
					);
				})}
			</div>

			<RedesignBottomNav />
		</div>
	);
};

export default AdminComponent;
