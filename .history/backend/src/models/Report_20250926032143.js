const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  attachments: [{ filename: String, url: String }],
  status: { type: String, default: 'To Do' }, // mirrored from Jira
  jiraIssueId: { type: String },
  jiraIssueKey: { type: String },
  jiraUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', ReportSchema);
