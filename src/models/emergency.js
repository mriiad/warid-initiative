const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cities = require('../utils/cities');
const { BLOOD_GROUP_VALUES } = require('../utils/constants');
/** 
  An Emergency can be created by users and confirmed by admins
 */

const EmergencySchema = new Schema({
	bloodGroup: {
		type: String,
		enum: BLOOD_GROUP_VALUES,
		required: [true, 'Blood group is required'],
	},
	city: {
		type: String,
		enum: cities,
		required: [true, 'City is required'],
	},
	phoneNumber: {
		type: String,
		required: [true, 'Phone Number is required'],
	},
	details: {
		type: String,
		required: false,
	},
	isConfirmed: {
		type: Boolean,
		default: false,
	},
	contactedUsers: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

module.exports = mongoose.model('Emergency', EmergencySchema);
