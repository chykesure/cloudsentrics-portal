const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "Open" },
    jiraIssueId: { type: String }, // to link Jira
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
