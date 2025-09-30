const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const jiraService = require('../services/jiraService'); // we'll sketch this below
const authMiddleware = require('../middleware/auth'); // checks JWT and sets req.user

// Create report (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    // 1) Save local report (initial)
    const report = await Report.create({
      userId: req.user._id,
      title, description, priority
    });

    // 2) Create Jira issue
    const jiraPayload = {
      summary: title,
      description: `Reported by ${req.user.email}\n\n${description}`,
      priority: priority // optional mapping
    };

    const jiraResp = await jiraService.createIssue(jiraPayload, req.user);

    // 3) Update report with Jira info
    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    // Optionally set status to Jira status
    report.status = jiraResp.fields?.status?.name || report.status;
    await report.save();

    return res.status(201).json({ report, jira: { key: jiraResp.key, id: jiraResp.id } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create report' });
  }
});

module.exports = router;
