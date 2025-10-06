// models/Request.js
const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    reporterName: { type: String, required: true },
    reporterEmail: { type: String, required: true },
    phone: { type: String },
    company: { type: String },
    accountId: { type: String },
    bucketName: { type: String },
    priority: { type: String, default: "Medium" },
    title: { type: String, required: true },
    description: { type: String },

    selectedTier: { type: String },
    awsAccounts: [
      {
        alias: String,
        orgName: String,
      },
    ],
    selectedStorageCount: { type: Number },
    bucketNote: { type: String },
    awsCountText: { type: String },

    accessList: [
      {
        fullName: String,
        email: String,
        accessLevel: String,
      },
    ],

    step4Data: {
      fileSharing: String,
      fileOptions: [String],
      otpPlan: Object,
      customOtp: Object,
      lifecycle: String,
      retentionDays: String,
      retentionMonths: String,
      transitionGlacier: String,
      transitionStandard: String,
    },

    acknowledgements: [String],

    // 🆕 Step6: Change Section
    existingAccountId: { type: String },
    existingStorageName: { type: String },
    changesRequested: [String],
    details: { type: String },

    // Jira tracking
    jiraIssueId: { type: String },
    jiraIssueKey: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
