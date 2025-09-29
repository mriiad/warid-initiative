const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ParticipantSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
});

ParticipantSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model("Participant", ParticipantSchema);
