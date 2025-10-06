// controllers/reportController.js

const Report = require("../models/Report");
const { createIssue, getIssue, updateIssue, deleteIssue } = require("../services/jiraService");
const { sendEmail } = require("../services/emailService");

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

    // Save locally first
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
      image: req.file ? { buffer: req.file.buffer, filename: req.file.originalname } : null,
    });

    await report.save();

    // Build Jira description (plain professional format)
    const lines = [
      `Reporter: ${fullName} (${email})`,
      phone ? `Phone: ${phone}` : null,
      company ? `Company: ${company}` : null,
      `Account ID: ${accountId}`,
      bucketName ? `Bucket Name: ${bucketName}` : null,
      title ? `Title: ${title}` : null,
      description ? `Description: ${description}` : null,
      `Priority: ${priority || "Medium"}`,
      date || time ? `Date/Time: ${date || "N/A"} / ${time || "N/A"}` : null,
      category ? `Category: ${category}` : null,
      otherCategoryDesc ? `Other Category: ${otherCategoryDesc}` : null,
      steps ? `Steps Taken: ${steps}` : null,
      confirm ? `Confirmed: Yes` : null,
      req.file ? `Attached Image: ${req.file.originalname}` : null,
    ].filter(Boolean).join("\n");

    // Create Jira issue
    const jiraResp = await createIssue({
      summary: title || `Report by ${fullName}`,
      description: lines,
      priority,
    });

    // Save Jira info
    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    await report.save();

    // Send confirmation email (non-blocking)
    try {
      const subject = `Cloudsentrics: We received your report (${report.jiraIssueKey || "No-ID"})`;

      const text = `
Hi ${fullName},

Your issue has been received and logged successfully. Our team will review and update you shortly.

Issue Title: ${title || "N/A"}
Tracking ID: ${report.jiraIssueKey || "N/A"}
Track here: ${report.jiraUrl || "N/A"}

Thank you,
Cloudsentrics Support
`;

      const html = `
<div style="font-family: Arial, sans-serif; color: #111;">
  <h2>Your issue has been received</h2>
  <p>Hi <strong>${fullName}</strong>,</p>
  <p>Thanks — we got your report and created a tracking ticket. Our support team will review it and update you shortly.</p>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td style="font-weight:700;">Issue Title:</td>
      <td>${title || "N/A"}</td>
    </tr>
    <tr>
      <td style="font-weight:700;">Tracking ID:</td>
      <td>${report.jiraIssueKey || "N/A"}</td>
    </tr>
  </table>
  <p>If you didn't expect this email or need urgent help, reply to this message.</p>
  <p>— <strong>Cloudsentrics Support</strong></p>
</div>
`;

      await sendEmail(email, subject, text, html);
    } catch (mailErr) {
      console.warn("⚠️ Failed to send confirmation email:", mailErr.message || mailErr);
    }

    // Respond to frontend
    res.status(201).json({
      success: true,
      message: "Report created successfully. A confirmation email has been sent.",
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
        const lines = [
          `Reporter: ${report.fullName} (${report.email})`,
          report.phone ? `Phone: ${report.phone}` : null,
          report.company ? `Company: ${report.company}` : null,
          `Account ID: ${report.accountId}`,
          report.bucketName ? `Bucket Name: ${report.bucketName}` : null,
          report.title ? `Title: ${report.title}` : null,
          report.description ? `Description: ${report.description}` : null,
          `Priority: ${report.priority || "Medium"}`,
          report.date || report.time ? `Date/Time: ${report.date || "N/A"} / ${report.time || "N/A"}` : null,
          report.category ? `Category: ${report.category}` : null,
          report.otherCategoryDesc ? `Other Category: ${report.otherCategoryDesc}` : null,
          report.steps ? `Steps Taken: ${report.steps}` : null,
          report.confirm ? `Confirmed: Yes` : null,
          report.image ? `Attached Image: ${report.image.filename}` : null,
        ].filter(Boolean).join("\n");

        await updateIssue(report.jiraIssueId, {
          summary: report.title || `Report by ${report.fullName}`,
          description: lines,
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
