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

function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
}

// ===============================
// Create Request
// ===============================
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    // Filter out empty values
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          !(Array.isArray(value) && value.length === 0)
      )
    );

    // Save request to Mongo
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

    // Save Jira info in Mongo
    newRequest.jiraIssueId = jiraResponse.data.id;
    newRequest.jiraIssueKey = jiraResponse.data.key; // SCRUM-123
    newRequest.status = "Received"; // initial status
    await newRequest.save();

    // Send acknowledgement email to reporter
    if (cleanData.reporterEmail) {
      const ticketId = newRequest.jiraIssueKey;
      const ackMailOptions = {
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: cleanData.reporterEmail,
        subject: `Your Request Has Been Received – [Ticket #${ticketId}]`,
        html: `
          <p>Dear Client,</p>
          <p>We have received your request (Ticket ID: <strong>${ticketId}</strong>).</p>
          <p>Our engineers will be assigned shortly to review your case.</p>
          <br/>
          <p>Kind regards,<br/>Cloud Sentrics Support Team</p>
        `,
      };

      sendEmail(ackMailOptions)
        .then(info => console.log("Acknowledgement email sent:", info.response))
        .catch(err => console.error("Error sending acknowledgement email:", err));
    }

    res.status(201).json({
      message: "Request created, synced with Jira, and acknowledgment email sent",
      jiraIssueKey: newRequest.jiraIssueKey,
      request: newRequest,
    });
  } catch (error) {
    console.error("❌ Error creating request:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create request",
      error: error.response?.data || error.message,
    });
  }
});

// ===============================
// Assign Request to Engineer
// ===============================
router.post("/assign", async (req, res) => {
  try {
    const { requestId, engineerEmail } = req.body;

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.assignedEngineer = engineerEmail;
    request.status = "Assigned";
    await request.save();

    // Notify reporter
    if (request.reporterEmail) {
      const ticketId = request.jiraIssueKey;
      const mailOptions = {
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: request.reporterEmail,
        subject: `Your Request Has Been Assigned – [Ticket #${ticketId}]`,
        html: `
          <p>Dear Client,</p>
          <p>Your request (Ticket ID: <strong>${ticketId}</strong>) has been assigned to an engineer: <strong>${engineerEmail}</strong>.</p>
          <p>Work will begin shortly, and you will receive updates as progress is made.</p>
          <br/>
          <p>Kind regards,<br/>Cloud Sentrics Support Team</p>
        `,
      };

      sendEmail(mailOptions)
        .then(info => console.log("Assignment email sent:", info.response))
        .catch(err => console.error("Error sending assignment email:", err));
    }

    res.json({ message: "Task assigned and reporter notified", request });
  } catch (error) {
    console.error("❌ Error assigning task:", error);
    res.status(500).json({ message: "Failed to assign task", error: error.message });
  }
});

// ===============================
// Update Request Status
// ===============================
router.post("/status", async (req, res) => {
  try {
    const { requestId, status } = req.body;

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.status = status;
    await request.save();

    // Optional: notify reporter on status change
    if (request.reporterEmail) {
      const ticketId = request.jiraIssueKey;
      const mailOptions = {
        from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
        to: request.reporterEmail,
        subject: `Update on Your Request – [Ticket #${ticketId}]`,
        html: `
          <p>Dear Client,</p>
          <p>Your request (Ticket ID: <strong>${ticketId}</strong>) status has been updated to: <strong>${status}</strong>.</p>
          <p>You will receive further updates as progress continues.</p>
          <br/>
          <p>Kind regards,<br/>Cloud Sentrics Support Team</p>
        `,
      };

      sendEmail(mailOptions)
        .then(info => console.log("Status update email sent:", info.response))
        .catch(err => console.error("Error sending status update email:", err));
    }

    res.json({ message: "Request status updated and reporter notified", request });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
});

module.exports = router;
