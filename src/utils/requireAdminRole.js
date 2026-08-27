const User = require('../models/user');
const { STATUS_CODE } = require('./errors/httpStatusCode');

/**
 * Route guard for admin endpoints split by responsibility (see issue #183):
 * Principal Admin has full access to everything, Emergency Admin and Event
 * Admin are restricted to their own area.
 *
 * allowedRoles lists which non-principal roles may call this route (e.g.
 * requireAdminRole(['emergency'])). Pass [] for a principal-only route --
 * every other admin role is refused, but a plain admin (isAdmin: true, no
 * role field set) still gets through: every admin had full access before
 * roles existed, and this field is undefined on every one of them until a
 * principal explicitly reassigns their role (or the migration script in
 * src/scripts/backfill-admin-roles.js backfills it). Treating "no role
 * recorded" as anything less than full access would silently lock existing
 * admins out of routes they could already reach.
 */
module.exports = (allowedRoles) => {
	return async (req, res, next) => {
		try {
			if (!req.userId) {
				return res
					.status(STATUS_CODE.UNAUTHORIZED)
					.json({ message: 'Not authenticated.' });
			}
			const user = await User.findById(req.userId).lean();
			if (!user) {
				return res
					.status(STATUS_CODE.NOT_FOUND)
					.json({ message: 'User Not found.' });
			}
			if (!user.isAdmin) {
				return res
					.status(STATUS_CODE.FORBIDDEN)
					.json({ message: 'User must be an Admin to call this API.' });
			}
			if (user.role && user.role !== 'principal' && !allowedRoles.includes(user.role)) {
				return res.status(STATUS_CODE.FORBIDDEN).json({
					message: 'This admin role does not have access to this action.',
				});
			}
			return next();
		} catch (err) {
			return next(err);
		}
	};
};
