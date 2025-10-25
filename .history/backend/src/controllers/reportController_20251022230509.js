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

    // Jira description
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

    // Save Jira info in DB
    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    await report.save();

    // Send acknowledgment email
    try {
      const subject = `Support Ticket Acknowledgment – Tracking ID: ${report.jiraIssueKey}`;
      const text = `Dear ${companyName || fullName},

Thank you for contacting Cloud Sentrics Support.
Your issue has been successfully received and logged.

Tracking ID: ${report.jiraIssueKey}
Track your ticket here: ${report.jiraUrl}

Please keep this tracking ID for your reference.

Kind regards,
Cloud Sentrics Support Team
customersupport@cloudsentrics.org
www.cloudsentrics.org`;

      const html = `
  <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border:1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #1a73e8;">Support Ticket Acknowledgment</h2>
    <p>Dear <strong>${companyName || fullName}</strong>,</p>
    <p>Thank you for contacting <strong>Cloud Sentrics Support</strong>. Your issue has been successfully received and logged.</p>
    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin: 20px 0; width: 100%;">
      <tr>
        <td style="font-weight: 700; background-color: #f5f5f5; width: 150px;">Tracking ID:</td>
        <td style="background-color: #f9f9f9;"><a href="${report.jiraUrl}" style="color:#1a73e8; text-decoration:none;">${report.jiraIssueKey}</a></td>
      </tr>
      <tr>
        <td style="font-weight: 700; background-color: #f5f5f5;">Issue Title:</td>
        <td style="background-color: #f9f9f9;">${title || "N/A"}</td>
      </tr>
    </table>
    <p>Please keep this tracking ID for your reference. It will help us monitor and update you on the progress of your request.</p>
    <p>If you didn't expect this email or require urgent assistance, please reply to this message.</p>
    <hr style="border:none; border-top:1px solid #e0e0e0; margin: 20px 0;">
    <p style="font-size: 0.9em; color: #555;">
      Kind regards,<br>
      <strong>Cloud Sentrics Support Team</strong><br>
      <a href="mailto:customersupport@cloudsentrics.org" style="color:#1a73e8;">customersupport@cloudsentrics.org</a><br>
      <a href="https://www.cloudsentrics.org" style="color:#1a73e8;">www.cloudsentrics.org</a>
    </p>
  </div>
  `;

      await sendEmail(email, subject, text, html);
      console.log(`✅ Confirmation email sent to ${email}`);
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
    console.error("❌ Error creating report:", err);
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
          description: updatedData.description || report.description,
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
