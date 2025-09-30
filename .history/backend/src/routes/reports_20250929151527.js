const express = require("express");
const multer = require("multer");
const Report = require("../models/Report");
const jiraService = require("../services/jiraService");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Use memory storage for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Build Jira description from all fields
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
`;
};

// CREATE REPORT
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
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

    // Required fields
    if (!fullName || !email || !accountId || confirm !== "true") {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields or confirmation" });
    }

    const report = new Report({
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
      confirm: confirm === "true",
      image: req.file ? req.file.buffer : null,
    });

    await report.save();

    // Jira Issue
    try {
      const jiraResp = await jiraService.createIssue({
        summary: title || `Report by ${fullName}`,
        description: buildJiraDescription(report),
        priority,
      });

      report.jiraIssueId = jiraResp.id || jiraResp.key;
      report.jiraIssueKey = jiraResp.key;
      report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
      await report.save();
    } catch (jiraErr) {
      console.warn("Jira issue creation failed:", jiraErr.message);
    }

    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to create report" });
  }
});

module.exports = router;
