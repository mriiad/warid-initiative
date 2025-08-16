const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

module.exports = async (req, res, next) => {
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
		return next();
	} catch (err) {
		return next(err);
	}
};
