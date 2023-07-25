const User = require('../models/user');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

module.exports = (req, res, next) => {
	User.findOne({ _id: req.userId }).then((user) => {
		if (!user) {
			return res
				.status(STATUS_CODE.NOT_FOUND)
				.send({ message: 'User Not found.' });
		}
		if (!user.isAdmin) {
			return res
				.status(STATUS_CODE.FORBIDDEN)
				.send({ message: 'User must be an Admin to call this API.' });
		}
	});
	next();
};
