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

    // Save report to DB
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

    // Save Jira info in report
    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    await report.save();

    // -------------------- Send confirmation email to reporter --------------------
    try {
      const subject = `Cloudsentrics: We received your report (${report.jiraIssueKey})`;
      const text = `Hi ${fullName},\n\nYour issue has been received and logged successfully.\nTracking ID: ${report.jiraIssueKey}\nTrack here: ${report.jiraUrl}`;
      const html = `
        <div style="font-family: Arial, sans-serif; color: #111;">
          <h2>Your issue has been received</h2>
          <p>Hi <strong>${fullName}</strong>,</p>
          <p>Thanks — we got your report and created a tracking ticket. Our support team will review it and update you shortly.</p>
          <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
            <tr><td style="font-weight:700;">Issue Title:</td><td>${title || "N/A"}</td></tr>
            <tr><td style="font-weight:700;">Tracking ID:</td><td>${report.jiraIssueKey || "N/A"}</td></tr>
          </table>
          <p>If you didn't expect this email or need urgent help, reply to this message.</p>
          <p>— <strong>Cloudsentrics Support</strong></p>
        </div>
      `;
      await sendEmail(email, subject, text, html);
    } catch (mailErr) {
      console.warn("⚠️ Failed to send confirmation email:", mailErr.message || mailErr);
    }

    // -------------------- Send email to Jira assignee (if exists) --------------------
    try {
      const assigneeEmail = jiraResp.fields.assignee?.emailAddress;
      if (assigneeEmail) {
        const assigneeName = jiraResp.fields.assignee.displayName || "User";
        const subject = `Cloudsentrics: A task has been assigned to you (${report.jiraIssueKey})`;
        const text = `Hi ${assigneeName},\n\nYou have been assigned a new Jira task.\n\nTitle: ${title}\nTracking ID: ${report.jiraIssueKey}\nView Issue: ${report.jiraUrl}`;
        const html = `
          <div style="font-family: Arial, sans-serif; color: #111;">
            <h2>New Task Assigned</h2>
            <p>Hi <strong>${assigneeName}</strong>,</p>
            <p>You have been assigned a new Jira task:</p>
            <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
              <tr><td style="font-weight:700;">Title:</td><td>${title}</td></tr>
              <tr><td style="font-weight:700;">Tracking ID:</td><td>${report.jiraIssueKey}</td></tr>
            </table>
            <p>Check the issue here: <a href="${report.jiraUrl}">${report.jiraUrl}</a></p>
            <p>— <strong>Cloudsentrics Support</strong></p>
          </div>
        `;
        await sendEmail(assigneeEmail, subject, text, html);
      }
    } catch (assigneeErr) {
      console.warn("⚠️ Failed to send email to assignee:", assigneeErr.message || assigneeErr);
    }

    res.status(201).json({
      success: true,
      message: "Report created successfully. Emails sent to reporter and assignee (if assigned).",
      report,
      jira: { key: jiraResp.key, id: jiraResp.id, url: report.jiraUrl },
    });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: "Failed to create report" });
  }
};
