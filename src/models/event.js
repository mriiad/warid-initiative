const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * An Event that can be attended by many users
 */

const EventSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	subtitle: {
		type: String,
		required: false,
	},
	location: {
		type: String,
		required: true,
	},
	mapLink: {
		type: String,
		required: false,
	},
	userId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: false,
	},
});

module.exports = mongoose.model('Event', EventSchema);
