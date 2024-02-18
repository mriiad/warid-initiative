const User = require('../models/user');
const ApiError = require('../utils/errors/ApiError');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

// Get all users
exports.getUsers = async (req, res, next) => {
    try {
        const currentPage = Number(req.query.page) || 1;
        const perPage = 10;

        const totalItems = await User.countDocuments();

        const users = await User.find(
            {},
            'username email phoneNumber gender isAdmin'
        )
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(STATUS_CODE.OK).json({
            message: 'Fetched users successfully.',
            users: users,
            totalItems: totalItems,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = STATUS_CODE.INTERNAL_SERVER;
        }
        next(err);
    }
};
