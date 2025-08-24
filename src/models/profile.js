const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { cities } = require('../utils/cities');
const { BLOOD_GROUP_VALUES } = require('../utils/constants');

const profileSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		unique: true,
	},
	firstname: String,
	lastname: String,
	birthdate: Date,
	bloodGroup: {
		type: String,
		enum: BLOOD_GROUP_VALUES,
		required: false,
	},
	city: {
		type: String,
		enum: cities,
		required: true,
	},
});

module.exports = mongoose.model('Profile', profileSchema);
