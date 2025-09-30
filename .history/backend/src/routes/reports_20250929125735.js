const express = require('express');
const multer = require('multer');
const Report = require('../models/Report');
const jiraService = require('../services/jiraService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer(); // in-memory storage

router.post('/', authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const report = await Report.create({
      userId: req.user._id,
      title,
      description,
      priority,
      // optionally save image buffer
      image: req.file ? req.file.buffer : null,
    });

    const jiraResp = await jiraService.createIssue({
      summary: title,
      description: `Reported by ${req.user.email}\n\n${description}`,
      priority: priority,
    }, req.user);

    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    report.status = jiraResp.fields?.status?.name || report.status;
    await report.save();

    res.status(201).json({ report, jira: { key: jiraResp.key, id: jiraResp.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

module.exports = router;
