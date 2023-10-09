const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String },
  image: { type: String, default: "" },
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
});

const User = mongoose.model("User", userSchema);

module.exports = User;
