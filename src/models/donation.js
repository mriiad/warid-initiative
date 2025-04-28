const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Donation collection to collect donors' data
 */

const DonationSchema = new Schema({
	donationDate: {
		type: Date,
		required: false,
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
