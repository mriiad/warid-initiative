const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Contact is a collection linked to one user and storing his contact details
 */

const ContactSchema = new Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	birthDate: {
		type: Date,
		required: true,
	},
	gender: {
		type: String,
		required: true,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});

module.exports = mongoose.model('Contact', ContactSchema);
