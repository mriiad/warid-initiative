import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth as useAuthContext } from '../../auth/AuthContext';
import { redesignColors } from '../../styles/authRedesign';

const useStyles = makeStyles({
	wrapper: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 100,
		display: 'flex',
		justifyContent: 'center',
	},
	bar: {
		width: '100%',
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: '24px',
		borderTopRightRadius: '24px',
		boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-around',
		padding: '14px 12px calc(14px + env(safe-area-inset-bottom))',
	},
	item: {
		background: 'none',
		border: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '6px',
		cursor: 'pointer',
		color: redesignColors.placeholder,
		textDecoration: 'none',
	},
	itemActive: {
		color: redesignColors.headerRose,
	},
});

const NAV_ITEMS = [
	{ path: '/home', icon: HomeIcon, labelKey: 'nav.home', adminOnly: false },
	{ path: '/events?page=1', icon: CalendarMonthIcon, labelKey: 'nav.calendar', matchPath: '/events', adminOnly: false },
	{ path: '/emergency', icon: HealthAndSafetyIcon, labelKey: 'nav.emergency', adminOnly: false },
	{ path: '/profile', icon: PersonOutlineIcon, labelKey: 'nav.profile', adminOnly: false },
	{ path: '/admin', icon: AdminPanelSettingsIcon, labelKey: 'nav.admin', adminOnly: true },
	{ path: '/users?page=1', icon: PeopleIcon, labelKey: 'admin.usersList', matchPath: '/users', adminOnly: true },
];

// The bottom nav for redesigned screens. Home and events work for anyone
// ('/home' shows LandingPage for non-admins, the redesigned dashboard for
// admins; '/events' similarly falls back to the pre-existing page for
// non-admins). '/emergency' is intentionally public (no isAuth on that
// route -- see App.tsx) and reachable by anyone for that reason: this was
// previously the only bottom nav in the redesigned screens, and it had no
// entry for it at all, making the emergency blood-request form unreachable
// from navigation for every user. Profile is likewise available to every
// signed-in user (donor or admin) -- previously there was no way to reach
// it from the bottom nav at all. Admin and users are admin-only routes,
// guarded server- and route-side elsewhere too.
const RedesignBottomNav = () => {
	const { wrapper, bar, item, itemActive } = useStyles();
	const { t } = useTranslation();
	const location = useLocation();
	const { isAdmin } = useAuthContext();

	const visibleItems = NAV_ITEMS.filter((navItem) => isAdmin || !navItem.adminOnly);

	const renderItem = (navItem: (typeof NAV_ITEMS)[number]) => {
		const Icon = navItem.icon;
		const active = location.pathname === (navItem.matchPath || navItem.path);
		return (
			<Link
				key={navItem.path}
				to={navItem.path}
				className={active ? `${item} ${itemActive}` : item}
				aria-label={t(navItem.labelKey)}
			>
				<Icon />
			</Link>
		);
	};

	const midpoint = Math.ceil(visibleItems.length / 2);
	const firstHalf = visibleItems.slice(0, midpoint);
	const secondHalf = visibleItems.slice(midpoint);

	return (
		<div className={wrapper}>
			<div className={bar}>
				{firstHalf.map(renderItem)}
				{secondHalf.map(renderItem)}
			</div>
		</div>
	);
};

export default RedesignBottomNav;
