const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    accountId: { type: String, required: true },
    bucketName: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    date: { type: String },
    time: { type: String },
    category: { type: String },
    otherCategoryDesc: { type: String },
    steps: { type: String },
    confirm: { type: Boolean, required: true },
    image: {
      data: Buffer,
      filename: String,
      contentType: String,
    },
    jiraIssueId: { type: String },
    jiraIssueKey: { type: String },
    jiraUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
