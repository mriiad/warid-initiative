const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true,
	},
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
