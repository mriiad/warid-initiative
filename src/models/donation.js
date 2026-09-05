const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Donation collection to collect donors' data
 */

const DonationSchema = new Schema({
	// Required: a donation with no date can't be reasoned about by the
	// eligibility rules -- the comparisons go NaN and lock the donor out.
	donationDate: {
		type: Date,
		required: true,
	},
	donationType: {
		type: String,
		required: false,
	},
	// Absent means the donor's account was deleted. The donation itself is
	// kept: the blood was really collected, so it stays in the association's
	// historical totals, but nothing points at a user who no longer exists.
	// Queries that ask for one donor's donations (Donation.find({ userId }))
	// simply never match these. See issue #406.
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: false,
	},
	eventId: {
		type: Schema.Types.ObjectId,
		ref: 'Event',
		required: true,
	},
});

// donate() decides eligibility by reading (checkDonationEligibility, then
// checkExistingDonation) and only then writes, so two requests arriving
// together both pass the reads before either inserts -- a double-tap on
// submit, or a client retry after a slow response, recorded the donation
// twice. This was the only model with no unique index, so nothing caught
// it, and the duplicate then inflated the donor's dashboard total,
// getAdminStats.totalDonations and every event's donater counts
// permanently.
//
// One donation per donor per day is stricter than the 60/90-day rest
// period but never contradicts it: the cooldown already forbids two
// donations in a day. The date arrives from a date input, so racing
// submissions carry an identical value and the second insert is refused by
// the database rather than by a read that has already gone stale --
// translateMongooseError (#368) turns that into a friendly 409.
// See issue #405.
DonationSchema.index({ userId: 1, donationDate: 1 }, { unique: true });

module.exports = mongoose.model('Donation', DonationSchema);
