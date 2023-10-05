const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	phoneNumber: {
		type: Number,
		required: true,
	},
	refreshToken: {
		type: String,
		required: false,
		unique: true,
		select: false,
		default: null,
	},
	isAdmin: {
		type: Boolean,
		required: true,
	},
	isActive: {
		type: Boolean,
		required: true,
	},
	confirmationCode: {
		type: String,
		unique: true,
	},
	events: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Event',
			required: false,
		},
	],
});

module.exports = mongoose.model('User', userSchema);
