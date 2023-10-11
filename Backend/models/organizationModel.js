const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
