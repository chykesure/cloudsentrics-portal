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

    // ✅ Validate required fields
    if (!fullName || !email || !accountId || !confirm) {
      return res.status(400).json({ error: "Missing required fields or confirmation" });
    }

    // ✅ Prepare image data
    let imageData = null;
    if (req.file) {
      imageData = { path: req.file.path, filename: req.file.filename };
    }

    // ✅ Save report to DB
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

    // ✅ Build Jira description
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

    // ✅ Create Jira issue
    const jiraResp = await createIssue({
      summary: title || `Report by ${fullName}`,
      description: jiraDescription,
      priority,
    });

    // ✅ Save Jira info in MongoDB
    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    await report.save();

    // ✅ Send confirmation email (non-blocking)
    try {
      const subject = `Cloudsentrics: We received your report (${report.jiraIssueKey || "No-ID"})`;
      const text = `Hi ${fullName},

Your issue has been received and logged successfully.
Tracking ID: ${report.jiraIssueKey || "N/A"}
Track your ticket here: ${report.jiraUrl || "N/A"}

Thank you,
Cloudsentrics Support Team`;

      const html = `
<div style="font-family: Arial, sans-serif; color: #111;">
  <h2>Your issue has been received</h2>
  <p>Hi <strong>${fullName}</strong>,</p>
  <p>Thanks — we received your report and created a tracking ticket. Our support team will review it and update you shortly.</p>
  <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td style="font-weight:700;">Issue Title:</td>
      <td>${title || "N/A"}</td>
    </tr>
    <tr>
      <td style="font-weight:700;">Tracking ID:</td>
      <td>${report.jiraIssueKey || "N/A"}</td>
    </tr>
    <tr>
      <td style="font-weight:700;">Track Ticket:</td>
      <td><a href="${report.jiraUrl || "#"}">${report.jiraUrl || "N/A"}</a></td>
    </tr>
  </table>
  <p>If you didn't expect this email or need urgent help, reply to this message.</p>
  <p>— <strong>Cloudsentrics Support</strong></p>
</div>`;

      await sendEmail(email, subject, text, html);
      console.log(`✅ Confirmation email sent to ${email}`);
    } catch (mailErr) {
      console.warn("⚠️ Failed to send confirmation email:", mailErr.message || mailErr);
    }

    // ✅ Return response
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
