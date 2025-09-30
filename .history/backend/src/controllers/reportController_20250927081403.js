const Report = require("../models/Report");
const jiraService = require("../services/jiraService");

exports.createReport = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id; // from auth middleware

    // Create Jira Issue
    const jiraIssue = await jiraService.createIssue({
      summary: title,
      description,
    });

    // Save to MongoDB
    const report = new Report({
      user: userId,
      title,
      description,
      jiraIssueId: jiraIssue.key,
    });
    await report.save();

    res.status(201).json({
      message: "Report submitted successfully",
      report,
      jiraUrl: `${process.env.JIRA_BASE_URL}/browse/${jiraIssue.key}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit report" });
  }
};
