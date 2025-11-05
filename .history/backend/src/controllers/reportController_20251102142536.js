// controllers/reportController.js
const Report = require("../models/Report");
const Onboarding = require("../models/Onboarding"); // ✅ fetch companyEmail from onboarding table
const nodemailer = require("nodemailer");
const {
  createIssue,
  getIssue,
  updateIssue,
  deleteIssue,
} = require("../services/jiraService");

// ===============================
// ✅ Nodemailer Setup
// ===============================
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Prevent TLS rejection on Hostinger
  },
  logger: true,
  debug: true,
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) console.error("❌ SMTP verification failed:", error);
  else console.log("✅ SMTP server ready to send mail");
});

function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
}

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
      date,
      time,
      category,
      otherCategoryDesc,
      steps,
      confirm,
    } = req.body;

    if (!fullName || !email || !accountId || !confirm) {
      return res
        .status(400)
        .json({ error: "Missing required fields or confirmation" });
    }

    // Prepare image data if uploaded
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
      date,
      time,
      category,
      otherCategoryDesc,
      steps,
      confirm,
      image: imageData,
    });

    await report.save();

    // Jira description body
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
`;

    // Create Jira issue
    const jiraResp = await createIssue({
      summary: `Issue Reported by (${email})`,
      description: jiraDescription,
    });

    report.jiraIssueId = jiraResp.id;
    report.jiraIssueKey = jiraResp.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResp.key}`;
    await report.save();

    // ------------------------------
    // ✅ Fetch company email from Onboarding table
    // ------------------------------
    const onboardingRecord = await Onboarding.findOne({ customerId: accountId });

    // Prefer companyEmail first, fallback to primaryEmail or form email
    let recipientEmail =
      onboardingRecord?.companyInfo?.companyEmail?.trim() ||
      onboardingRecord?.companyInfo?.primaryEmail?.trim() ||
      email;

    console.log("📧 Acknowledgment email will be sent to:", recipientEmail);

    // ------------------------------
    // ✅ Send acknowledgment email
    // ------------------------------
    if (recipientEmail) {
      const ticketId = report.jiraIssueKey;

      const ackMailOptions = {
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Your Request Has Been Received – [Ticket #${ticketId}]`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; color: #333;">
          <div style="background-color: #1a73e8; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin:0; font-size: 20px;">Cloud Sentrics Support</h1>
          </div>
          <div style="padding: 20px; line-height: 1.6;">
            <p>Dear ${fullName},</p>
            <p>Thank you for contacting <strong>CloudSentrics Limited</strong>.</p>
            <p>We have received your request with the following details:</p>
            <table cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #e0e0e0;">
              <tr style="background-color: #f5f5f5;">
                <td style="font-weight: 700; width: 150px;">Ticket ID:</td>
                <td>${ticketId}</td>
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

      try {
        const info = await sendEmail(ackMailOptions);
        console.log(
          `✅ Acknowledgment email sent to ${recipientEmail}:`,
          info.response
        );
      } catch (err) {
        console.error("❌ Error sending acknowledgment email:", err.message || err);
      }
    } else {
      console.warn(
        "⚠️ No companyEmail or fallback email found — acknowledgment email skipped"
      );
    }

    // ------------------------------
    // Final success response
    // ------------------------------
    res.status(201).json({
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
    console.error("❌ Error creating report:", err.message || err);
    res.status(500).json({ success: false, error: err.message || err });
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
    console.error("❌ Error fetching reports:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- GET REPORT BY ID --------------------
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report)
      return res.status(404).json({ success: false, error: "Report not found" });
    res.json({ success: true, report });
  } catch (err) {
    console.error("❌ Error fetching report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// -------------------- UPDATE REPORT --------------------
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const report = await Report.findByIdAndUpdate(id, updatedData, { new: true });
    if (!report)
      return res.status(404).json({ success: false, error: "Report not found" });

    if (report.jiraIssueId) {
      try {
        await updateIssue(report.jiraIssueId, {
          summary: report.title || `Report by ${report.fullName}`,
          description: updatedData.description || report.description,
          priority: report.priority,
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

// -------------------- DELETE REPORT --------------------
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report)
      return res.status(404).json({ success: false, error: "Report not found" });

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
