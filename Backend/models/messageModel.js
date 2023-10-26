const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recepientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  messageType: {
    type: String,
    enum: ["text", "image"],
  },
  message: String,
  imageUrl: String,
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
