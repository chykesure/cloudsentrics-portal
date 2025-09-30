const express = require('express');
const multer = require('multer');
const Report = require('../models/Report');
const jiraService = require('../services/jiraService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer(); // in-memory storage

router.post('/', authMiddleware, upload.single("image"), async (req, res) => {
  try {
    // Extract all fields from FormData
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
    } = req.body;

    // Create report in MongoDB
    const report = await Report.create({
      userId: req.user._id,
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
      image: req.file ? req.file.buffer : null,
    });

    // Create Jira issue
    const jiraResp = await jiraService.createIssue(
      {
        summary: title,
        description: `Reported by ${req.user.email}\n\n${description}\n\nSteps: ${steps || "N/A"}`,
        priority: priority,
      },
      req.user
    );

    // Update report with Jira info
    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    report.status = jiraResp.fields?.status?.name || report.status;
    await report.save();

    // Send response
    res.status(201).json({
      message: "Report submitted successfully",
      reportId: report._id,
      jira: { key: jiraResp.key, id: jiraResp.id, url: report.jiraUrl },
    });
  } catch (err) {
    console.error("Report submission error:", err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

module.exports = router;
