import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import HomeIcon from '@mui/icons-material/Home';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import PeopleIcon from '@mui/icons-material/People';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth as useAuthContext } from '../../auth/AuthContext';
import { AdminRole } from '../../data/constants';
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

type NavItem = {
	path: string;
	icon: typeof HomeIcon;
	labelKey: string;
	matchPath?: string;
};

// Home and events work for anyone ('/home' shows LandingPage for
// non-admins, the redesigned dashboard for admins; '/events' similarly
// falls back to the pre-existing page for non-admins). '/emergency' is
// intentionally public (no isAuth on that route -- see App.tsx) and
// reachable by anyone for that reason: this was previously the only bottom
// nav in the redesigned screens, and it had no entry for it at all, making
// the emergency blood-request form unreachable from navigation for every
// user. Profile is likewise available to every signed-in user (donor or
// admin) -- previously there was no way to reach it from the bottom nav at
// all. Issue #183 leaves this exact set untouched for a guest/donor and,
// per its own note that the public create-emergency icon "stays public...
// nothing in this issue changes it", for Principal Admin too.
const EVERYONE_ITEMS: NavItem[] = [
	{ path: '/home', icon: HomeIcon, labelKey: 'nav.home' },
	{ path: '/events?page=1', icon: CalendarMonthIcon, labelKey: 'nav.calendar', matchPath: '/events' },
	{ path: '/emergency', icon: HealthAndSafetyIcon, labelKey: 'nav.emergency' },
	{ path: '/profile', icon: PersonOutlineIcon, labelKey: 'nav.profile' },
];

// Principal Admin "keeps the navbar as it is today" (issue #183) -- the
// full set above, plus these two. Route-guarded (App.tsx / AdminComponent)
// independently of what's shown here.
const PRINCIPAL_ONLY_ITEMS: NavItem[] = [
	{ path: '/admin', icon: AdminPanelSettingsIcon, labelKey: 'nav.admin' },
	{ path: '/users?page=1', icon: PeopleIcon, labelKey: 'admin.usersList', matchPath: '/users' },
];

// "The event admin sees only the dashboard and the event icon in the
// navbar" (issue #183) -- literally only these two, not the full set above
// with items removed. Reuses the same '/events' destination everyone else
// gets: EventsComponent already renders the admin add/edit/delete view
// for any isAdmin caller, Event Admin included.
const EVENT_ADMIN_ITEMS: NavItem[] = [
	{ path: '/home', icon: HomeIcon, labelKey: 'nav.home' },
	{ path: '/events?page=1', icon: CalendarMonthIcon, labelKey: 'nav.calendar', matchPath: '/events' },
];

// "The emergency admin sees only the dashboard and a list icon to manage
// the emergencies" (issue #183) -- '/emergencies' (plural, the admin
// unconfirmed-emergencies list), not '/emergency' (singular, the public
// create form covered by EVERYONE_ITEMS above, which this role does not
// get either per the literal "only").
const EMERGENCY_ADMIN_ITEMS: NavItem[] = [
	{ path: '/home', icon: HomeIcon, labelKey: 'nav.home' },
	{ path: '/emergencies?page=1', icon: NotificationImportantIcon, labelKey: 'nav.emergencies', matchPath: '/emergencies' },
];

const RedesignBottomNav = () => {
	const { wrapper, bar, item, itemActive } = useStyles();
	const { t } = useTranslation();
	const location = useLocation();
	const { isAdmin, adminRole } = useAuthContext();

	// An admin with no role recorded (every admin from before roles existed)
	// gets the same full nav as Principal -- see adminAccess.ts for why.
	const visibleItems: NavItem[] = !isAdmin
		? EVERYONE_ITEMS
		: adminRole === AdminRole.Event
		? EVENT_ADMIN_ITEMS
		: adminRole === AdminRole.Emergency
		? EMERGENCY_ADMIN_ITEMS
		: [...EVERYONE_ITEMS, ...PRINCIPAL_ONLY_ITEMS];

	const renderItem = (navItem: NavItem) => {
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
