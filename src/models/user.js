const mongoose = require("mongoose");
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
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  refreshToken: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    select: false,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  },
  // Meaningful only when isAdmin is true. Absent (undefined) on every admin
  // created before role-based access existed -- middleware/requireAdminRole.js
  // treats that the same as 'principal' (full access), matching what every
  // admin could already do before this field existed, rather than silently
  // losing access on deploy. See issue #183.
  role: {
    type: String,
    enum: ["principal", "emergency", "event"],
    required: false,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  confirmationCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  confirmationCodeExpires: {
    type: Date,
    required: false,
    select: false,
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
  profile: { type: Schema.Types.ObjectId, ref: "Profile" },
  // `donations` used to live here: an array pushed on every donation and
  // read by nothing. Every reader -- getDashboard, getAdminStats, the event
  // participation counts, emergency matching -- queries the Donation
  // collection directly, which is the single source of truth. Being
  // write-only it was also never corrected (deleteEvent reassigns donations
  // between events and never touched it), so it grew without bound on a
  // document fetched on nearly every authenticated request while silently
  // drifting from reality. See issue #407.
});

module.exports = mongoose.model("User", userSchema);
