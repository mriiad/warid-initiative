const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Donation collection to collect donors' data
 */

const DonationSchema = new Schema({
	lastDonationDate: {
		type: Date,
		required: false,
	},
	donationType: {
		type: String,
		required: false,
	},
	reelDonationDate: {
		type: Date,
		required: false,
	},
	disease: {
		type: String,
		required: false,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

module.exports = mongoose.model('Donation', DonationSchema);
