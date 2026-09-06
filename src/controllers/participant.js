const Participant = require('../models/participant');
const Event = require('../models/event');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { checkDonationEligibility } = require('./donation');
const ApiError = require('../utils/errors/ApiError');
const { ERROR_CODES } = require('../utils/errors/errorCodes');

exports.createParticipant = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const userId = req.userId;

    const event = await Event.findOne({ reference });
    if (!event) {
      // Through the shared handler rather than a hand-built body, so it
      // carries a code the client can translate. See issue #434.
      throw new ApiError(
        `Event with reference ${reference} not found.`,
        STATUS_CODE.NOT_FOUND,
        [],
        ERROR_CODES.EVENT_NOT_FOUND
      );
    }

    const eligibility = await checkDonationEligibility(userId);

    if (!eligibility.canDonate) {
      throw new ApiError(
        `You cannot donate yet. You can participate again on ${eligibility.nextDonationDate}`,
        STATUS_CODE.FORBIDDEN,
        [],
        ERROR_CODES.PARTICIPATION_NOT_ELIGIBLE,
        { nextDonationDate: eligibility.nextDonationDate }
      );
    }

    const participant = new Participant({
      userId,
      eventId: event._id,
    });

    await participant.save();

    return res.status(STATUS_CODE.CREATED).json({
      message: 'User successfully registered as participant.',
    });
  } catch (error) {
    // Routed through the shared handler (issue #368) instead of a local,
    // hand-built 500 -- a duplicate registration (Participant has a unique
    // index on userId+eventId, guarding a double-click/race/stale cache)
    // now gets a proper "already in use" message via
    // translateMongooseError instead of a generic "Server error".
    next(error);
  }
};

exports.checkUserParticipation = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const userId = req.userId;

    const event = await Event.findOne({ reference });
    if (!event) {
      throw new ApiError(
        `Event with reference ${reference} not found.`,
        STATUS_CODE.NOT_FOUND,
        [],
        ERROR_CODES.EVENT_NOT_FOUND
      );
    }

    const participant = await Participant.findOne({
      eventId: event._id,
      userId,
    });

    return res.status(STATUS_CODE.OK).json({
      hasParticipated: !!participant,
      message: participant ? "User has already participated" : "User has not participated yet"
    });
  } catch (err) {
    next(err);
  }
};
