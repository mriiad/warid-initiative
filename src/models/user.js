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
  donations: [
    {
      type: Schema.Types.ObjectId,
      ref: "Donation",
      required: false,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
