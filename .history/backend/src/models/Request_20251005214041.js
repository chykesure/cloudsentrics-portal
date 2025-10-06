const mongoose = require("mongoose");

const AwsAccountSchema = new mongoose.Schema({
  alias: { type: String, required: true },
  orgName: { type: String, required: true },
});

const AccessListSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  accessLevel: { type: String, required: true },
});

const RequestSchema = new mongoose.Schema(
  {
    reporterName: { type: String, required: true },
    reporterEmail: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    accountId: { type: String },
    bucketName: { type: String },
    priority: { type: String, default: "Medium" },
    title: { type: String },
    description: { type: String },
    selectedTier: { type: String, default: "standard" },

    // AWS accounts
    awsAccounts: [AwsAccountSchema],
    selectedStorageCount: { type: Number },
    bucketNote: { type: String },
    awsCountText: { type: String },

    // Step4 data
    step4Data: { type: Object },

    // Access list
    accessList: [AccessListSchema],

    // Step6 acknowledgements
    acknowledgements: [String],

    // Step6 Change section
    existingAccountId: { type: String },
    existingStorageName: { type: String },
    changesRequested: [String],
    details: { type: String },

    // Jira
    jiraIssueId: { type: String },
    jiraIssueKey: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
