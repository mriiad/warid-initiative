const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: Buffer },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    mapLink: { type: String },
    description: { type: String },
    isGeneric: { type: Boolean, default: false },
    qrCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
