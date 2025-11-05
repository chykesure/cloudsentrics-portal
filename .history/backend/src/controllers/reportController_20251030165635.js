// controllers/reportController.js
const Report = require("../models/Report");
const nodemailer = require("nodemailer");
const { createIssue, getIssue, updateIssue, deleteIssue } = require("../services/jiraService");

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
      return res.status(400).json({ error: "Missing required fields or confirmation" });
    }

    // Prepare image data
    let imageData = null;
    if (req.file) {
      imageData = { path: req.file.path, filename: req.file.filename };
    }

    // Save report to DB (email not required for saving)
    const report = new Report({
      fullName,
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

    // ------------------------------
    // 5️⃣ Create ADF-style Jira Description
    // ------------------------------
    const descriptionADF = {
      type: "doc",
      version: 1,
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: `Reporter: ${fullName} (${email})` },
          ],
        },
        { type: "paragraph", content: [{ type: "text", text: `Phone: ${phone || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Company: ${company || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Account ID: ${accountId}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Bucket Name: ${bucketName || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Title: ${title || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Description: ${description || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Date/Time: ${date || "N/A"} / ${time || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Category: ${category || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Other Category: ${otherCategoryDesc || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Steps Taken: ${steps || "N/A"}` }] },
        { type: "paragraph", content: [{ type: "text", text: `Confirmed: ${confirm ? "Yes" : "No"}` }] },
      ],
    };

    // ------------------------------
    // 6️⃣ Sync to Jira (like requestController)
    // ------------------------------
    const jiraResponse = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: title || `Issue Reported by ${email}`,
          description: descriptionADF,
          issuetype: { name: "Task" },
        },
      },
      {
        auth: {
          username: process.env.JIRA_EMAIL,
          password: process.env.JIRA_API_TOKEN,
        },
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    // ------------------------------
    // 7️⃣ Save Jira Info in MongoDB
    // ------------------------------
    report.jiraIssueId = jiraResponse.data.id;
    report.jiraIssueKey = jiraResponse.data.key;
    report.jiraUrl = `${process.env.JIRA_BASE_URL}/browse/${jiraResponse.data.key}`;
    await report.save();

    // ------------------------------
    // 8️⃣ Send acknowledgment email
    // ------------------------------
    if (email) {
      const ticketId = report.jiraIssueKey;
      const ackMailOptions = {
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Request Has Been Received – [Ticket #${ticketId}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; color: #333;">
            <div style="background-color: #1a73e8; color: #fff; padding: 20px; text-align: center;">
              <h1 style="margin:0; font-size: 20px;">Cloud Sentrics Support</h1>
            </div>
            <div style="padding: 20px; line-height: 1.6;">
              <p>Dear Client,</p>
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

      sendEmail(ackMailOptions)
        .then((info) => console.log("✅ Acknowledgment email sent:", info.response))
        .catch((err) => console.error("❌ Error sending email:", err));
    }

    // ------------------------------
    // 9️⃣ Response
    // ------------------------------
    res.status(201).json({
      success: true,
      message: "Report created, synced with Jira, and acknowledgment email sent",
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
    if (!report) return res.status(404).json({ success: false, error: "Report not found" });
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
    console.error("❌ Error updating report:", err.message);
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
    console.error("❌ Error deleting report:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
