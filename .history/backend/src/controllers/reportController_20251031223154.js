// controllers/reportController.js
const Report = require("../models/Report");
const nodemailer = require("nodemailer");
const {
  createIssue,
  getIssue,
  updateIssue,
  deleteIssue,
} = require("../services/jiraService");

// ===============================
// ✉️ Nodemailer Setup
// ===============================
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return info;
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw err;
  }
}

// ===============================
// 🧾 CREATE REPORT
// ===============================
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
      date,
      time,
      category,
      otherCategoryDesc,
      steps,
      confirm,
    } = req.body;

    // Validation
    if (!fullName || !email || !accountId || !confirm) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields or confirmation" });
    }

    // Image handling
    const imageData = req.file
      ? { path: req.file.path, filename: req.file.filename }
      : null;

    // Save initial report
    const report = await Report.create({
      fullName,
      email,
      phone,
      company,
      accountId,
      bucketName,
      title,
      description,
      date,
      time,
      category,
      otherCategoryDesc,
      steps,
      confirm,
      image: imageData,
    });

    // Jira description (plain text)
    const jiraDescription = `
Reporter: ${fullName} (${email})
Phone: ${phone || "N/A"}
Company: ${company || "N/A"}
Account ID: ${accountId}
Bucket Name: ${bucketName || "N/A"}
Title: ${title || "N/A"}
Description: ${description || "N/A"}
Date/Time: ${date || "N/A"} / ${time || "N/A"}
Category: ${category || "N/A"}
Other Category: ${otherCategoryDesc || "N/A"}
Steps Taken: ${steps || "N/A"}
Confirmed: ${confirm ? "Yes" : "No"}
    `.trim();

    // Create Jira issue
    const jira = await createIssue({
      summary: `Issue Reported by (${email})`,
      description: jiraDescription,
    });

    // Update report with Jira info
    report.jiraIssueId = jira.id;
    report.jiraIssueKey = jira.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jira.key}`;
    await report.save();

    // Send acknowledgment email
    if (email) {
      const ackMail = {
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Request Has Been Received – [Ticket #${report.jiraIssueKey}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; color: #333;">
            <div style="background-color: #1a73e8; color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin:0; font-size: 20px;">Cloud Sentrics Support</h1>
            </div>
            <div style="padding: 20px; line-height: 1.6;">
              <p>Dear Client,</p>
              <p>Thank you for contacting <strong>CloudSentrics Limited</strong>.</p>
              <p>We have received your report with the following details:</p>
              <table cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #e0e0e0;">
                <tr style="background-color: #f5f5f5;">
                  <td style="font-weight: 700; width: 150px;">Ticket ID:</td>
                  <td>${report.jiraIssueKey}</td>
                </tr>
              </table>
              <p>One of our engineers will be assigned shortly to review your case.</p>
              <p>You will receive another update once your ticket has been assigned.</p>
              <br/>
              <p>Kind regards,</p>
              <p><strong>Cloud Sentrics Support Team</strong><br/>
              <a href="mailto:customersupport@cloudsentrics.org" style="color:#1a73e8;">customersupport@cloudsentrics.org</a><br/>
              <a href="https://www.cloudsentrics.org" style="color:#1a73e8;">www.cloudsentrics.org</a></p>
            </div>
          </div>
        `,
      };

      await sendEmail(ackMail);
    }

    return res.status(201).json({
      success: true,
      message:
        "Report created, synced with Jira, and acknowledgment email sent",
      report,
      jira: {
        key: report.jiraIssueKey,
        id: report.jiraIssueId,
        url: report.jiraUrl,
      },
    });
  } catch (err) {
    console.error("❌ Error creating report:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ===============================
// 📋 GET ALL REPORTS
// ===============================
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find();

    const enriched = await Promise.all(
      reports.map(async (r) => {
        let jiraStatus = null;
        if (r.jiraIssueId) {
          try {
            const jira = await getIssue(r.jiraIssueId, "status");
            jiraStatus = jira.fields.status.name;
          } catch {
            console.warn(`⚠️ Could not fetch Jira issue ${r.jiraIssueId}`);
          }
        }
        return { ...r._doc, jiraStatus };
      })
    );

    res.json({ success: true, reports: enriched });
  } catch (err) {
    console.error("❌ Error fetching reports:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===============================
// 🔍 GET REPORT BY ID
// ===============================
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, error: "Report not found" });
    res.json({ success: true, report });
  } catch (err) {
    console.error("❌ Error fetching report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===============================
// ✏️ UPDATE REPORT
// ===============================
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const report = await Report.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!report)
      return res
        .status(404)
        .json({ success: false, error: "Report not found" });

    // Sync Jira if applicable
    if (report.jiraIssueId) {
      try {
        await updateIssue(report.jiraIssueId, {
          summary: report.title || `Report by ${report.fullName}`,
          description: updatedData.description || report.description,
        });
      } catch (err) {
        console.warn(
          `⚠️ Jira update failed for ${report.jiraIssueId}:`,
          err.message
        );
      }
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error("❌ Error updating report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===============================
// 🗑️ DELETE REPORT
// ===============================
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, error: "Report not found" });

    await report.deleteOne();

    if (report.jiraIssueId) {
      try {
        await deleteIssue(report.jiraIssueId);
      } catch (err) {
        console.warn(
          `⚠️ Jira delete failed for ${report.jiraIssueId}:`,
          err.message
        );
      }
    }

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
