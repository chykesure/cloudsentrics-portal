const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    // Reporter info
    reporterName: String,
    reporterEmail: String,
    phone: String,
    company: String,
    accountId: String,
    bucketName: String,

    // Basic request info
    priority: String,
    title: String,
    description: String,

    // AWS accounts and storage details
    awsAccounts: [
      {
        alias: String,
        orgName: String,
      },
    ],
    selectedStorageCount: Number,
    bucketNote: String,
    awsCountText: String,

    // Access control list (Step3)
    accessList: [
      {
        fullName: String,
        email: String,
        accessLevel: String,
      },
    ],

    // Step4 configuration
    step4Data: {
      fileSharing: String,
      fileOptions: [String],
      otpPlan: Object,
      customOtp: Object,
      accessLogging: String,
      lifecycle: String,
      customerKey: String,
      retentionDays: String,
      retentionMonths: String,
      transitionGlacier: Boolean,
      transitionStandard: Boolean,
    },

    // Acknowledgements (Step6)
    acknowledgements: [String],

    // Jira info
    jiraIssueId: String,
    jiraIssueKey: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
