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

// Reachable with no session at all. '/home' renders LandingPage for a
// visitor (the redesigned dashboard for admins, Dashboard for a signed-in
// donor), '/events' falls back to the public list, and '/emergency' is
// deliberately ungated -- no isAuth on that route, see App.tsx -- so
// someone who needs blood can ask without first making an account. That
// icon was once missing entirely, which left the request form unreachable
// from navigation for everyone.
const PUBLIC_ITEMS: NavItem[] = [
	{ path: '/home', icon: HomeIcon, labelKey: 'nav.home' },
	{ path: '/events?page=1', icon: CalendarMonthIcon, labelKey: 'nav.calendar', matchPath: '/events' },
	{ path: '/emergency', icon: HealthAndSafetyIcon, labelKey: 'nav.emergency' },
];

// Needs a session. /profile reads GET /api/user/profile, which answers 401
// without one, and the route is registered unconditionally with no guard of
// its own -- so a logged-out visitor who tapped this icon was taken to a
// profile screen that could never populate. Every signed-in user gets it,
// donor and admin alike -- before this item existed there was no way to
// reach the profile from the bottom nav at all. Issue #451.
const PROFILE_ITEM: NavItem = {
	path: '/profile',
	icon: PersonOutlineIcon,
	labelKey: 'nav.profile',
};

const EVERYONE_ITEMS: NavItem[] = [...PUBLIC_ITEMS, PROFILE_ITEM];

// Principal Admin "keeps the navbar as it is today" (issue #183) -- the
// signed-in set above, plus these two. Route-guarded (App.tsx / AdminComponent)
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
// the emergencies" (issue #183). That "only" was taken literally, and it
// took away two things that are not somebody else's area: their own profile,
// and the emergency form -- which is public, so this role was the one group
// of signed-in users who could not open it from the nav. Issue #459 asks for
// both back.
//
// Both emergency destinations are here and they are different screens:
// '/emergencies' (plural) is the admin unconfirmed-emergencies list, and
// '/emergency' (singular) is the create form every visitor gets.
const EMERGENCY_ADMIN_ITEMS: NavItem[] = [
	{ path: '/home', icon: HomeIcon, labelKey: 'nav.home' },
	{ path: '/emergency', icon: HealthAndSafetyIcon, labelKey: 'nav.emergency' },
	{ path: '/emergencies?page=1', icon: NotificationImportantIcon, labelKey: 'nav.emergencies', matchPath: '/emergencies' },
	PROFILE_ITEM,
];

const RedesignBottomNav = () => {
	const { wrapper, bar, item, itemActive } = useStyles();
	const { t } = useTranslation();
	const location = useLocation();
	const { isAdmin, adminRole, token } = useAuthContext();

	// An admin with no role recorded (every admin from before roles existed)
	// gets the same full nav as Principal -- see adminAccess.ts for why.
	//
	// The token check comes first because isAdmin is false for a logged-out
	// visitor exactly as it is for a donor, so the non-admin branch below was
	// serving both and handing a guest a profile icon (issue #451). Every
	// admin has a token, so this only ever narrows the guest case.
	const visibleItems: NavItem[] = !token
		? PUBLIC_ITEMS
		: !isAdmin
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
