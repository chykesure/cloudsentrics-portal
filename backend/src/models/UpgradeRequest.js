const mongoose = require("mongoose");

const UpgradeRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: "N/A",
  },
  fullName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
  },
  previousTier: {
    type: String,
    default: "N/A",
  },
  newTier: {
    type: String,
    required: true,
  },
  previousStorage: {
    type: String,
    default: "N/A",
  },
  newStorage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  timestamp: {
    type: Date,
    default: Date.now, // 🕒 when the request was created
  },
  approvedAt: {
    type: Date, // 🕓 when the request is approved
  },
});

module.exports = mongoose.model("UpgradeRequest", UpgradeRequestSchema);
