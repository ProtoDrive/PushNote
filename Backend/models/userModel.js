const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  username: { type: String, required: false },
  image: { type: String, default: "", required: false },
  bio: { type: String, default: "", required: false },
  activated: { type: Boolean, required: false, default: false },
  task: [
    {
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    },
  ],
  freindRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  sentFriendRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  organizationInvitations: [
    {
      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: Date,
      accepted: {
        type: Boolean,
        default: false,
      },
    },
  ],
  organizations: [
    {
      organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
      role: {
        type: String,
        enum: ["admin", "member"],
      },
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;
