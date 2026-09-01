const Participant = require('../models/participant');
const Event = require('../models/event');
const { STATUS_CODE } = require('../utils/errors/httpStatusCode');
const { checkDonationEligibility } = require('./donation');

exports.createParticipant = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const userId = req.userId;

    const event = await Event.findOne({ reference });
    if (!event) {
      return res.status(STATUS_CODE.NOT_FOUND).json({
        message: `Event with reference ${reference} not found.`,
      });
    }

    const eligibility = await checkDonationEligibility(userId);

    if (!eligibility.canDonate) {
      return res.status(STATUS_CODE.FORBIDDEN).json({
        message: `You cannot donate yet. You can participate again on ${eligibility.nextDonationDate}`,
      });
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
      return res.status(STATUS_CODE.NOT_FOUND).json({
        message: `Event with reference ${reference} not found.`,
      });
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
