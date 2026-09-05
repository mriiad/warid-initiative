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

module.exports = mongoose.model('Donation', DonationSchema);
