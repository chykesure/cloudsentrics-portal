// routes/reports.js
const express = require('express');
const multer = require('multer');
const Report = require('../models/Report');
const jiraService = require('../services/jiraService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer(); // in-memory storage

// Utility: Build Jira description from all fields including file
const buildJiraDescription = (report) => {
  return `
*Reporter:* ${report.fullName} (${report.email})
*Phone:* ${report.phone || "N/A"}
*Company:* ${report.company || "N/A"}
*Account ID:* ${report.accountId}
*Bucket Name:* ${report.bucketName || "N/A"}
*Title:* ${report.title || "N/A"}
*Description:* ${report.description || "N/A"}
*Priority:* ${report.priority || "Medium"}
*Date/Time:* ${report.date || "N/A"} / ${report.time || "N/A"}
*Category:* ${report.category || "N/A"}
*Other Category:* ${report.otherCategoryDesc || "N/A"}
*Steps Taken:* ${report.steps || "N/A"}
*Confirmation:* ${report.confirm ? "Yes" : "No"}
*Attached File:* ${report.imageName || "None"}
`;
};

// -------------------- CREATE REPORT --------------------
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      company,
      accountId,
      bucketName,
      title,
      description,
      priority,
      date,
      time,
      category,
      otherCategoryDesc,
      steps,
      confirm,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !accountId || !confirm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields or confirmation',
      });
    }

    // Save report locally first
    const report = new Report({
      fullName,
      email,
      phone,
      company,
      accountId,
      bucketName,
      title,
      description,
      priority,
      date,
      time,
      category,
      otherCategoryDesc,
      steps,
      confirm,
      image: req.file ? req.file.buffer : null,
      imageName: req.file ? req.file.originalname : null,
    });

    await report.save();

    // Create Jira issue
    try {
      const jiraResp = await jiraService.createIssue({
        summary: title || `Report by ${fullName}`,
        description: buildJiraDescription(report),
        priority,
      });

      report.jiraIssueId = jiraResp.key; // Jira issue key
      report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
      await report.save();
    } catch (jiraErr) {
      console.warn('⚠️ Jira issue creation failed:', jiraErr.message);
    }

    res.status(201).json({
      success: true,
      report,
      jira: report.jiraUrl ? { key: report.jiraIssueId, url: report.jiraUrl } : null,
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
