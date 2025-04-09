const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/** 
  An Emergency can be created by users and confirmed by admins
 */

  const EmergencySchema = new Schema({
    bloodGroup: {
		type: String,
		enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
		required: true,
	},
    placement: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: Number,
        required: true,
    },
    sickPersonInfo: {
        type: String,
        required: false,
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
   
  });
  
  module.exports = mongoose.model('Emergency', EmergencySchema);
  