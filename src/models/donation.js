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
// Partial, not plain unique: userId is optional because deleteUser
// anonymises a deleted donor's donations by unsetting it (#406), and this
// index does not skip those. MongoDB indexes a missing field as null, so two
// anonymised donations sharing a donationDate collided -- deleting a second
// user who donated on the same day as an already-deleted one failed with a
// duplicate key error, which at a blood drive is the ordinary case.
//
// `sparse: true` is not the fix here: on a compound index it only skips a
// document missing *all* the indexed fields, and donationDate is required,
// so nothing would ever be skipped. A partial filter drops exactly the
// anonymised rows and keeps the guard for every real donor. See issue #439.
DonationSchema.index(
	{ userId: 1, donationDate: 1 },
	{ unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

module.exports = mongoose.model('Donation', DonationSchema);
