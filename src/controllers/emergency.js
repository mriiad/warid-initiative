const Emergency = require("../models/emergency");
const user = require("../models/user");
const User = require("../models/user");
const ApiError = require("../utils/errors/ApiError");
const { STATUS_CODE } = require("../utils/errors/httpStatusCode");

// Get only the none confirmed emergencies
exports.getNotConfirmedEmergencies = async (req, res, next) => {
  try {
    const emergencies = await Emergency.find({ isConfirmed: false }).populate({
      path: "matchingUsers.user",
      select: "phoneNumber profile",
      populate: {
        path: "profile",
        select: "firstName lastName",
      },
    });
    res.status(STATUS_CODE.OK).json({
      message: "Fetched emergencies successfully.",
      emergencies: emergencies,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS_CODE.INTERNAL_SERVER;
    }
    next(err);
  }
};

// Create new emergency
exports.createEmergency = async (req, res) => {
  try {
    const { bloodGroup, placement, phoneNumber, sickPersonInfo } = req.body;
    const emergency = new Emergency({
      bloodGroup,
      placement,
      phoneNumber,
      sickPersonInfo,
    });
    // find users that have the same blood group in the emergency
    const users = await User.find({ bloodGroup });
    emergency.matchingUsers = users.map((user) => ({
      user: user._id,
      isConfirmed: false,
    }));

    await emergency.save();
    res
      .status(STATUS_CODE.CREATED)
      .json({ message: "Emergency successfully created", emergency });
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

// Confirm a user from the list of the matched users of an emergency
exports.confirmUserInEmergency = async (req, res, next) => {
  try {
    const { emergencyId, userId } = req.params;

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return next(new ApiError("Emergency not found", STATUS_CODE.NOT_FOUND));
    }

    const matchedUser = emergency.matchingUsers.find(
      (mu) => mu.user.toString() === userId
    );

    if (!matchedUser) {
      return next(
        new ApiError("User not found in emergency list", STATUS_CODE.NOT_FOUND)
      );
    }

    matchedUser.isConfirmed = true;
    await emergency.save();

    res.status(STATUS_CODE.OK).json({
      message: "User confirmed successfully in the emergency",
      emergency,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = STATUS_CODE.INTERNAL_SERVER;
    }
    next(err);
  }
};
