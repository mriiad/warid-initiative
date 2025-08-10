const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { cities }  = require('../utils/utils');


/** 
  An Emergency can be created by users and confirmed by admins
 */

const EmergencySchema = new Schema({
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: [true, 'Blood group is required'],
  },
  city: {
    type: String,
    enum: cities,
    required: [true, 'City is required'],
  },
  phoneNumber: {
    type: Number,
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
        ref: "User",
    },
  ],
});

module.exports = mongoose.model("Emergency", EmergencySchema);
