const mongoose = require("mongoose");

const organizationMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  messageType: {
    type: String,
    enum: ["text", "image"],
  },
  message: String,
  imageUrl: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const organizationMessage = mongoose.model(
  "organizationMessage",
  organizationMessageSchema
);

module.exports = organizationMessage;
