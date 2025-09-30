const Report = require("../models/Report");
const { createIssue } = require("../services/jiraService");
const { getIssue } = require("../services/jiraService");
const { updateIssue } = require("../services/jiraService");
const { deleteIssue } = require("../services/jiraService");

const Report = require("../models/Report");
const { createIssue, getIssue, updateIssue, deleteIssue } = require("../services/jiraService");
const path = require("path");
const fs = require("fs");

// POST /api/reports
exports.createReport = async (req, res) => {
  try {
    // Handle file upload
    let imageFile = null;
    if (req.file) {
      imageFile = req.file.filename;
    }

    // Extract all fields
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
    let report = new Report({
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

    // 2) Create Jira issue
    const jiraIssue = await createIssue(
      { summary: title || `Report by ${fullName}`, description, priority },
      null // no user auth yet
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
    console.error("Error creating report:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Other endpoints (GET, PUT, DELETE, GET by ID) remain exactly as in your existing code


// GET /api/reports
exports.getReports = async (req, res) => {
  try {
    // 1) Fetch all reports from MongoDB
    let reports = await Report.find();

    // 2) For each report, if it has a Jira issue, fetch status
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

// PUT /api/reports/:id
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority } = req.body;

    // 1) Update in MongoDB
    const report = await Report.findByIdAndUpdate(
      id,
      { title, description, priority },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    // 2) Update in Jira if linked
    if (report.jiraIssueId) {
      try {
        await updateIssue(report.jiraIssueId, { title, description, priority });
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


// DELETE /api/reports/:id
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Find report in MongoDB
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, error: "Report not found" });
    }

    // 2) Delete in MongoDB
    await report.deleteOne();

    // 3) Delete in Jira if linked
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

// GET /api/reports/:id
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
