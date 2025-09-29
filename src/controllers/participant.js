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
    console.error('Error creating participant:', error);
    return res
      .status(STATUS_CODE.INTERNAL_SERVER)
      .json({ message: 'Server error' });
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
    console.error('Error checking participation:', err);
    return res
      .status(STATUS_CODE.INTERNAL_SERVER)
      .json({ message: 'Server error' });
  }
};
















