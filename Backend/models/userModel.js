const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  username: { type: String, required: false },
  image: { type: String, default: "", required: false },
  activated: { type: Boolean, required: false, default: false },
  task: [
    {
      title: { type: String },
      content: { type: String },
      status: { type: String },
      createdTime: { type: Date, default: Date.now },
      deadlineTime: { type: Date },
      assigned: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
