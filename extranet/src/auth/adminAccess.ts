import { AdminRole } from '../data/constants';

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
