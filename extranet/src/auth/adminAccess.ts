import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { AdminRole, NORMAL_USER_ROLE } from '../data/constants';
import type { AssignableRole } from '../data/constants';

/**
 * One icon per role, shared by the role-assignment picker and the badge
 * shown on an admin's row/detail page (issue #183: "use distinct icons for
 * each role to visually differentiate them"). Matches the icon each role's
 * own restricted bottom-nav entry uses (RedesignBottomNav.tsx) -- an
 * admin's role icon is the icon of the area they manage.
 */
export const ADMIN_ROLE_ICONS: Record<AdminRole, typeof AdminPanelSettingsIcon> = {
	[AdminRole.Principal]: AdminPanelSettingsIcon,
	[AdminRole.Emergency]: NotificationImportantIcon,
	[AdminRole.Event]: CalendarMonthIcon,
};

/**
 * What the role picker offers, which is the three admin roles plus "Normal
 * User" -- the option that revokes admin access (issue #458). Separate from
 * ADMIN_ROLE_ICONS because the badge on a user's row and detail page marks
 * an admin's role, and a normal user has none to show.
 */
export const ASSIGNABLE_ROLE_ICONS: Record<
	AssignableRole,
	typeof AdminPanelSettingsIcon
> = {
	...ADMIN_ROLE_ICONS,
	[NORMAL_USER_ROLE]: PersonOutlineIcon,
};

/**
 * Mirrors the backend's requireAdminRole (src/utils/requireAdminRole.js):
 * Principal Admin has full access to everything, and an admin with no role
 * recorded -- every admin created before this field existed -- is treated
 * the same way, not refused. See issue #183.
 *
 * Used both for App.tsx's route guards and for the handful of admin screens
 * that also self-guard (matching the existing pattern where a route is kept
 * always-registered so it wins matching priority over a sibling wildcard --
 * see the events routes in App.tsx).
 */
export const hasAdminRole = (
	isAdmin: boolean,
	adminRole: AdminRole | null,
	allowedRoles: AdminRole[]
): boolean => {
	if (!isAdmin) return false;
	if (!adminRole || adminRole === AdminRole.Principal) return true;
	return allowedRoles.includes(adminRole);
};
