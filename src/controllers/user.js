const User = require('../models/user');
const ApiError = require('../utils/errors/ApiError');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');

// Get all users
exports.getUsers = async (req, res, next) => {
    try {

        //pagination parameters
        const currentPage = Number(req.query.page) || 1;
        const perPage = 10;
        const skip = (currentPage - 1) * perPage;

        // Fetch users from database

        const users = await User.find(
            {},
            'username email phoneNumber gender isAdmin'
        )
            .skip(skip)
            .limit(perPage);
            
        // Send users list in the response
        res.status(STATUS_CODE.OK).json({ users });
    } catch (error) {
        // handle error
        const apiError = new ApiError(
            'Internal Server Error',
            STATUS_CODE.INTERNAL_SERVER
        );

        res.status(apiError.statusCode).json(apiError.getErrorResponse());
    }
};
