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
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	eventId: {
		type: Schema.Types.ObjectId,
		ref: 'Event',
		required: true,
	},
});

module.exports = mongoose.model('Donation', DonationSchema);
