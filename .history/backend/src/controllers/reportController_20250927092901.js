const Report = require("../models/Report");
const { createIssue } = require("../services/jiraService");
const { getIssue } = require("../services/jiraService");
exports.createReport = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    // 1) Save locally first
    let report = new Report({ title, description, priority });
    await report.save();

    // 2) Create Jira issue
    const jiraIssue = await createIssue(
      { summary: title, description, priority },
      null // no user yet since auth not in use
    );

    // 3) Update MongoDB with Jira issue key
    report.jiraIssueId = jiraIssue.key;
    await report.save();

    res.status(201).json({
      success: true,
      report,
      jira: {
        key: jiraIssue.key,
        url: `${process.env.JIRA_BASE_URL}/browse/${jiraIssue.key}`,
      },
    });
  } catch (err) {
    console.error("Error creating report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
