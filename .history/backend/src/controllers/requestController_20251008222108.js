// routes/requestRoutes.js
const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const axios = require("axios");
const nodemailer = require("nodemailer");

// ===============================
// Nodemailer Setup
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

const sendEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
};

// ===============================
// Helper: Build HTML email template
// ===============================
const buildHtmlEmail = ({ clientName, ticketId, stage }) => {
  let subjectText = "";
  let bodyText = "";

  switch (stage) {
    case "received":
      subjectText = `Your Request Has Been Received – [Ticket #${ticketId}]`;
      bodyText = `
        <p>We have received your request (Ticket ID: <strong>${ticketId}</strong>).</p>
        <p>Our engineers will be assigned shortly to review your case.</p>`;
      break;

    case "assigned":
      subjectText = `Your Request Has Been Assigned – [Ticket #${ticketId}]`;
      bodyText = `
        <p>Your request (Ticket ID: <strong>${ticketId}</strong>) has been assigned to an engineer.</p>
        <p>Work will begin shortly, and you will receive updates as progress is made.</p>`;
      break;

    case "status":
      subjectText = `Update on Your Request – [Ticket #${ticketId}]`;
      bodyText = `<p>Your request (Ticket ID: <strong>${ticketId}</strong>) status has been updated.</p>`;
      break;

    default:
      subjectText = `Update on Your Request – [Ticket #${ticketId}]`;
      bodyText = `<p>There is an update regarding your request (Ticket ID: <strong>${ticketId}</strong>).</p>`;
      break;
  }

  return {
    subject: subjectText,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://cloudsentrics.org/assets/logo.jpg" alt="CloudSentrics Logo" style="width: 120px;" />
        </div>
        <p>Dear ${clientName || "Client"},</p>
        ${bodyText}
        <br/>
        <p>Kind regards,<br/>
        <strong>Cloud Sentrics Support Team</strong><br/>
        Cloud Sentrics Limited<br/>
        customersupport@cloudsentrics.org<br/>
        <a href="https://www.cloudsentrics.org">www.cloudsentrics.org</a></p>
      </div>
    `
  };
};

// ===============================
// Route: Create Request
// ===============================
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
    );

    const newRequest = new Request(cleanData);
    await newRequest.save();

    // Sync to Jira
    const jiraResponse = await axios.post(
      `${process.env.JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: cleanData.title || `Request from ${cleanData.reporterEmail}`,
          description: cleanData.description || cleanData.title || "Request details",
          issuetype: { name: "Task" },
          priority: { name: cleanData.priority || "Medium" },
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

    newRequest.jiraIssueId = jiraResponse.data.id;
    newRequest.jiraIssueKey = jiraResponse.data.key; // SCRUM ticket
    newRequest.status = "Received";
    await newRequest.save();

    // Send acknowledgment email
    if (cleanData.reporterEmail) {
      const { subject, html } = buildHtmlEmail({
        clientName: cleanData.reporterName || cleanData.reporterEmail,
        ticketId: newRequest.jiraIssueKey,
        stage: "received",
      });

      sendEmail({
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: cleanData.reporterEmail,
        subject,
        html,
      }).then(info => console.log("Acknowledgment email sent:", info.response))
        .catch(err => console.error("Error sending email:", err));
    }

    res.status(201).json({
      message: "Request created, synced with Jira, and acknowledgment email sent",
      jiraIssueKey: newRequest.jiraIssueKey,
      request: newRequest,
    });

  } catch (error) {
    console.error("❌ Error creating request:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create request", error: error.message });
  }
});

// ===============================
// Route: Assign Engineer
// ===============================
router.post("/assign", async (req, res) => {
  try {
    const { requestId, engineerEmail } = req.body;
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.assignedEngineer = engineerEmail;
    request.status = "Assigned";
    await request.save();

    if (request.reporterEmail) {
      const { subject, html } = buildHtmlEmail({
        clientName: request.reporterName || request.reporterEmail,
        ticketId: request.jiraIssueKey,
        stage: "assigned",
      });

      sendEmail({
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: request.reporterEmail,
        subject,
        html,
      }).then(info => console.log("Assignment email sent:", info.response))
        .catch(err => console.error("Error sending assignment email:", err));
    }

    res.json({ message: "Task assigned and reporter notified", request });

  } catch (error) {
    console.error("❌ Error assigning task:", error);
    res.status(500).json({ message: "Failed to assign task", error: error.message });
  }
});

// ===============================
// Route: Update Status
// ===============================
router.post("/status", async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.status = status;
    await request.save();

    if (request.reporterEmail) {
      const { subject, html } = buildHtmlEmail({
        clientName: request.reporterName || request.reporterEmail,
        ticketId: request.jiraIssueKey,
        stage: "status",
      });

      sendEmail({
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: request.reporterEmail,
        subject,
        html,
      }).then(info => console.log("Status email sent:", info.response))
        .catch(err => console.error("Error sending status email:", err));
    }

    res.json({ message: "Request status updated and reporter notified", request });

  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
});

module.exports = router;
