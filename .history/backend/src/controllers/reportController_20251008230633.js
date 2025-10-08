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

    // Prepare image data
    let imageData = null;
    if (req.file) {
      imageData = { path: req.file.path, filename: req.file.filename };
    }

    // Save to DB
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
      image: imageData,
    });

    await report.save();

    // Jira description (clean professional text)
    const jiraDescription = `
Reporter: ${fullName} (${email})
Phone: ${phone || "N/A"}
Company: ${company || "N/A"}
Account ID: ${accountId}
Bucket Name: ${bucketName || "N/A"}
Title: ${title || "N/A"}
Description: ${description || "N/A"}
Priority: ${priority || "Medium"}
Date/Time: ${date || "N/A"} / ${time || "N/A"}
Category: ${category || "N/A"}
Other Category: ${otherCategoryDesc || "N/A"}
Steps Taken: ${steps || "N/A"}
Confirmed: ${confirm ? "Yes" : "No"}
${imageData ? `Attached Image: ${imageData.filename}` : ""}
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

    // Send confirmation email (non-blocking)
    try {
      const subject = `Cloudsentrics: We received your report (${report.jiraIssueKey || "No-ID"})`;
      const text = `Hi ${fullName},\n\nYour issue has been received and logged successfully.\nTracking ID: ${report.jiraIssueKey || "N/A"}\nTrack here: ${report.jiraUrl || "N/A"}`;
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
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });
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
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });

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
