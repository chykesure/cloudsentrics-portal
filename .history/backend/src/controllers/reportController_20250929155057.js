const Report = require("../models/Report");
const { createIssue, getIssue, updateIssue, deleteIssue } = require("../services/jiraService");
const path = require("path");
const fs = require("fs");

// Utility: Build Jira description from all fields
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

// -------------------- CREATE REPORT --------------------
exports.createReport = async (req, res) => {
  try {
    // Handle file upload
    let imageFile = null;
    if (req.file) {
      imageFile = req.file.filename;
    }

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
      return res.status(400).json({ success: false, error: "Missing required fields or confirmation" });
    }

    // 1) Save locally first
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
      image: imageFile,
    });

    await report.save();

    // 2) Create Jira issue with all info
    const jiraIssue = await createIssue(
      {
        summary: title || `Report by ${fullName}`,
        description: buildJiraDescription(report),
        priority,
      },
      null // no auth yet
    );

    // 3) Save Jira key in MongoDB
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
    console.error("Error creating report:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- GET ALL REPORTS --------------------
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find();

    const enrichedReports = await Promise.all(
      reports.map(async (r) => {
        let status = null;
        if (r.jiraIssueId) {
          try {
            const jira = await getIssue(r.jiraIssueId, "status");
            status = jira.fields.status.name;
          } catch (err) {
            console.warn(`⚠️ Could not fetch Jira issue ${r.jiraIssueId}`);
          }
        }
        return { ...r._doc, jiraStatus: status };
      })
    );

    res.json({ success: true, reports: enrichedReports });
  } catch (err) {
    console.error("Error fetching reports:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- GET REPORT BY ID --------------------
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }
    res.json({ success: true, data: report });
  } catch (err) {
    console.error("Error fetching report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- UPDATE REPORT --------------------
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // 1) Update in MongoDB
    const report = await Report.findByIdAndUpdate(id, updatedData, { new: true });
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    // 2) Update in Jira with all fields if linked
    if (report.jiraIssueId) {
      try {
        await updateIssue(report.jiraIssueId, {
          summary: report.title || `Report by ${report.fullName}`,
          description: buildJiraDescription(report),
          priority: report.priority,
        });
      } catch (err) {
        console.warn(`⚠️ Jira update failed for ${report.jiraIssueId}:`, err.message);
      }
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error("Error updating report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- DELETE REPORT --------------------
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    await report.deleteOne();

    if (report.jiraIssueId) {
      try {
        await deleteIssue(report.jiraIssueId);
      } catch (err) {
        console.warn(`⚠️ Jira delete failed for ${report.jiraIssueId}:`, err.message);
      }
    }

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- JIRA WEBHOOK (Placeholder) --------------------
// This endpoint can be used for Jira → MongoDB sync
exports.jiraWebhook = async (req, res) => {
  try {
    const { issue } = req.body; // Jira payload
    if (!issue || !issue.key) return res.status(400).send("Invalid payload");

    const report = await Report.findOne({ jiraIssueId: issue.key });
    if (!report) return res.status(404).send("Report not found");

    // Example: update MongoDB fields from Jira
    const updatedFields = {
      title: issue.fields.summary,
      description: issue.fields.description,
      priority: issue.fields.priority?.name,
      // You can map more fields here if needed
    };

    await Report.findByIdAndUpdate(report._id, updatedFields, { new: true });
    res.status(200).send("MongoDB updated from Jira");
  } catch (err) {
    console.error("Jira webhook error:", err);
    res.status(500).send("Internal server error");
  }
};
