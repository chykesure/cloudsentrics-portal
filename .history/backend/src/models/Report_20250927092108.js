const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    jiraIssueId: { type: String }, // store Jira issue key (e.g. SCRUM-1)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
