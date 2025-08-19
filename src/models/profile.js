const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { cities }  = require('../utils/cities');


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
		enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
		required: false,
	},
	city: {
		type: String,
		enum: cities,
		required: true,
	  },
});

module.exports = mongoose.model('Profile', profileSchema);
