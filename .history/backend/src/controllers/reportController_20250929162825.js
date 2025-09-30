// controllers/reportController.js

const Report = require("../models/Report");
const { createIssue, getIssue, updateIssue, deleteIssue } = require("../services/jiraService");

// -------------------- CREATE REPORT --------------------
exports.createReport = async (req, res) => {
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
      image: req.file ? { buffer: req.file.buffer, filename: req.file.originalname } : null, // store file info
    });

    await report.save();

    // Build Jira description
  const jiraDescription = `
**Reporter:** ${fullName} (${email})
**Phone:** ${phone || "N/A"}
**Company:** ${company || "N/A"}
**Account ID:** ${accountId}
**Bucket Name:** ${bucketName || "N/A"}
**Title:** ${title || "N/A"}
**Description:** ${description || "N/A"}
**Priority:** ${priority || "Medium"}
**Date/Time:** ${date || "N/A"} / ${time || "N/A"}
**Category:** ${category || "N/A"}
**Other Category:** ${otherCategoryDesc || "N/A"}
**Steps Taken:** ${steps || "N/A"}
**Confirmed:** ${confirm ? "Yes" : "No"}
${req.file ? `**Attached Image:** ${req.file.originalname}` : ""}
`;


    // Create Jira issue
    const jiraResp = await createIssue({
      summary: title || `Report by ${fullName}`,
      description: jiraDescription,
      priority,
    });

    // Save Jira info
    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    await report.save();

    res.status(201).json({
      success: true,
      report,
      jira: { key: jiraResp.key, id: jiraResp.id, url: report.jiraUrl },
    });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: "Failed to create report" });
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

    const report = await Report.findByIdAndUpdate(id, updatedData, { new: true });
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    if (report.jiraIssueId) {
      try {
        await updateIssue(report.jiraIssueId, {
          summary: report.title || `Report by ${report.fullName}`,
          description: jiraDescription(report),
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
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });

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
