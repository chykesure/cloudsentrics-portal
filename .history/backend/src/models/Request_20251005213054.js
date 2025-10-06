const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  reporterName: String,
  reporterEmail: String,
  phone: String,
  company: String,
  accountId: String,
  bucketName: String,
  priority: String,
  title: String,
  description: String,
  awsAccounts: [
    {
      alias: String,
      orgName: String,
    }
  ],
  acknowledgements: {
    charges: Boolean,
    storage: Boolean,
    confirm: Boolean,
  },
  jiraIssueId: String,
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
