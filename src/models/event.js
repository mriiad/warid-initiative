const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * An Event that can be attended by many users
 */

const EventSchema = new Schema({
	reference: {
		type: String,
		required: true,
		unique: true,
	},
	title: {
		type: String,
		required: true,
	},
	subtitle: {
		type: String,
		required: false,
	},
	image: {
		type: Buffer,
		required: false,
	},
	location: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	mapLink: {
		type: String,
		required: false,
	},
	description: {
		type: String,
		required: true,
	},
	attendees: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: false,
		},
	],
});

module.exports = mongoose.model('Event', EventSchema);
