const Emergency = require("../models/emergency");
const User = require("../models/user");
const ApiError = require("../utils/errors/ApiError");
const { STATUS_CODE } = require("../utils/errors/httpStatusCode");

// Get only unconfirmed emergencies
exports.getUnconfirmedEmergencies = async (req, res, next) => {
    try {
      const currentPage = Number(req.query.page) || 1;
      const perPage = 8;
  
      
      const emergencies = await Emergency.find({ isConfirmed: false })
        .select("-contactedUsers") 
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .lean();
  
      const totalItems = await Emergency.countDocuments({ isConfirmed: false });
  
      res.status(STATUS_CODE.OK).json({
        message: "Fetched emergencies successfully.",
        emergencies: emergencies,
        totalItems: totalItems,
      });
    } catch (err) {
     if (!err.statusCode) {
        err.statusCode = STATUS_CODE.INTERNAL_SERVER;
      }
      next(err);
    }
  };
  
// Get emergency match users
exports.getEmergencyMatchUsers = async (req, res, next) => {
  try {
    const emergencyId = req.params.id;

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      throw new ApiError("Emergency not found.", STATUS_CODE.NOT_FOUND);
    }

    // Get all users with non-null profile
    const users = await User.find({ profile: { $ne: null } })
      .select("phoneNumber profile") 
      .populate({
        path: "profile",
        select: "bloodGroup firstname lastname city",
      });

    // Filter users who match bloodGroup and are NOT contacted yet (doesn't exist in contactedUsers)
    const matchingUsers = users
      .filter(
        (user) =>
          user.profile.bloodGroup === emergency.bloodGroup &&
          user.profile.city === emergency.city &&
          !emergency.contactedUsers.includes(user._id)
      )
      .map((user) => ({
        _id: user._id,
        phoneNumber: user.phoneNumber,
        firstname: user.profile.firstname,
        lastname: user.profile.lastname,
      }));

    res.status(STATUS_CODE.OK).json({
      message: "Fetched matched users successfully.",
      matchingUsers,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = STATUS_CODE.INTERNAL_SERVER;
    next(err);
  }
};

// Create new emergency
exports.createEmergency = async (req, res, next) => {
  try {
    const { bloodGroup, city, phoneNumber, details } = req.body;

    const emergency = new Emergency({
      bloodGroup,
      city,
      phoneNumber,
      details,
    });
 
    await emergency.save();

    res.status(STATUS_CODE.CREATED).json({
      message: 'Emergency successfully created',
      emergency,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS_CODE.INTERNAL_SERVER;
    }
    next(err);
  }
};

// Confirm emergency by id
exports.confirmEmergency = async (req, res, next) => {
  try {
    const emergencyId = req.params.id;

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return next(new ApiError("Emergency not found", STATUS_CODE.NOT_FOUND));
    }

    emergency.isConfirmed = true;
    await emergency.save();

    res
      .status(STATUS_CODE.OK)
      .json({ message: "The emergency is successfully confirmed" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS_CODE.INTERNAL_SERVER;
    }
    next(err);
  }
};

// Confirm users by adding them to the contactedUsers of an emergency
// The confirmed users are the users that have been contacted by the admin 
// Only the confirmed users are saved in the contactedUsers array
exports.confirmUserInEmergency = async (req, res, next) => {
  try {
    const { emergencyId, userId } = req.params;

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return next(new ApiError("Emergency not found", STATUS_CODE.NOT_FOUND));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ApiError("User not found", STATUS_CODE.NOT_FOUND));
    }

    const alreadyContacted = emergency.contactedUsers.some(
      id => id.toString() === userId
    );
    if (!alreadyContacted) {
      emergency.contactedUsers.push(userId);
    }

    await emergency.save();

    res.status(STATUS_CODE.OK).json({
      message: "The contacted user was added successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS_CODE.INTERNAL_SERVER;
    }
    next(err);
  }
};






