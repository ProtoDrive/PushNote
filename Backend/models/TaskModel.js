const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  status: { type: String },
  createdTime: { type: Date, default: Date.now },
  deadlineTime: { type: Date },
  assigned: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  taskMessages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
