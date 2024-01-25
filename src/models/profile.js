const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
	gender: { type: String, enum: ['male', 'female'] },
});

module.exports = mongoose.model('Profile', profileSchema);
