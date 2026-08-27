import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import { AdminRole } from '../data/constants';

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
