const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    // 👤 Reporter Information
    reporterName: { type: String, trim: true },
    reporterEmail: { type: String, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    accountId: { type: String, trim: true },
    bucketName: { type: String, trim: true },

    // ⚙️ General Request Info
    priority: { type: String, trim: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },

    // 💽 Tier and Storage
    selectedTier: { type: String, trim: true },
    selectedStorageCount: { type: Number },
    bucketNote: { type: String, trim: true },
    awsCountText: { type: String, trim: true },
    tierTitle: { type: String, trim: true },
tierStorage: { type: String, trim: true },


    // ☁️ AWS Accounts
    awsAccounts: [
      {
        alias: { type: String, trim: true },
        orgName: { type: String, trim: true },
      },
    ],

    // 👥 Access List
    accessList: [
      {
        fullName: { type: String, trim: true },
        email: { type: String, trim: true },
        accessLevel: { type: String, trim: true },
      },
    ],

    // ⚙️ Step4 Configuration
    step4Data: {
      fileSharing: { type: String, trim: true },
      fileOptions: [{ type: String, trim: true }],
      otpPlan: { type: Object },
      customOtp: { type: Object },
      lifecycle: { type: String, trim: true },
      retentionDays: { type: String, trim: true },
      retentionMonths: { type: String, trim: true },
      transitionGlacier: { type: String, trim: true },
      transitionStandard: { type: String, trim: true },
    },

    // ✅ Step6 - Acknowledgements & Change Requests
    acknowledgements: [{ type: String, trim: true }],
    existingAccountId: { type: String, trim: true },
    existingStorageName: { type: String, trim: true },
    changesRequested: [{ type: String, trim: true }],
    details: { type: String, trim: true },

    // 🧩 Jira Sync Info
    jiraIssueId: { type: String, trim: true },
    jiraIssueKey: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", RequestSchema);
