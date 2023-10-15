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
	gender: {
		type: String,
		enum: ['male', 'female'],
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
	passwordResetToken: {
		type: String,
		required: false,
		select: false,
	},
	passwordResetExpires: {
		type: Date,
		required: false,
		select: false,
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
