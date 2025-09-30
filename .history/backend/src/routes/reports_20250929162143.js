const express = require("express");
const multer = require("multer");
const Report = require("../models/Report");
const jiraService = require("../services/jiraService");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // in-memory storage

// Helper to build Jira description
const buildJiraDescription = (report) => {
  return `
Reporter: ${report.fullName} (${report.email})
Phone: ${report.phone || "N/A"}
Company: ${report.company || "N/A"}
Account ID: ${report.accountId}
Bucket Name: ${report.bucketName || "N/A"}
Title: ${report.title || "N/A"}
Description: ${report.description || "N/A"}
Priority: ${report.priority || "Medium"}
Date / Time: ${report.date || "N/A"} / ${report.time || "N/A"}
Category: ${report.category || "N/A"}
Other Category: ${report.otherCategoryDesc || "N/A"}
Steps Taken: ${report.steps || "N/A"}
Confirmed: ${report.confirm ? "Yes" : "No"}
${report.image ? `Attached Image: ${report.image.originalname}` : ""}
`;
};

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

    // Validate required fields
    if (!fullName || !email || !accountId || !confirm) {
      return res.status(400).json({ error: "Missing required fields or confirmation" });
    }

    // Save all fields locally
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
      image: req.file ? { buffer: req.file.buffer, originalname: req.file.originalname } : null,
    });

    await report.save();

    // Create Jira issue
    const jiraResp = await jiraService.createIssue({
      summary: title || `Report by ${fullName}`,
      description: buildJiraDescription(report),
      priority,
    });

    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    await report.save();

    res.status(201).json({ report, jira: { key: jiraResp.key, id: jiraResp.id } });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: "Failed to create report" });
  }
});

module.exports = router;
