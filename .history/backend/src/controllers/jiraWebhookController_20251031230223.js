//backend/src/controllers/jiraWebhookController.js

const axios = require("axios");
const nodemailer = require("nodemailer");
const { htmlToText } = require("html-to-text");

// ------------------------------
// ✅ Handle Jira Status Updates
// ------------------------------
exports.handleStatusUpdate = async (req, res) => {
  // ------------------------------
  // Internal sendEmail function
  // ------------------------------
  async function sendEmail({ from, to, subject, html }) {
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
    const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
    const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;

    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error("❌ EMAIL_USER or EMAIL_PASS not set in .env");
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    const text = htmlToText(html, {
      wordwrap: 130,
      selectors: [
        { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
        { selector: "img", format: "skip" },
      ],
    });

    const info = await transporter.sendMail({
      from: from || `"Cloud Sentrics Support" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  }

  // ------------------------------
  // Fetch Jira user email by accountId
  // ------------------------------
  async function getJiraUserEmail(accountId) {
    try {
      const response = await axios.get(
        `https://polycarpchike.atlassian.net/rest/api/3/user?accountId=${accountId}`,
        {
          auth: {
            username: process.env.JIRA_EMAIL,
            password: process.env.JIRA_API_TOKEN,
          },
        }
      );
      return response.data.emailAddress || null;
    } catch (err) {
      console.error("❌ Failed to fetch Jira user email:", err.response?.data || err.message);
      return null;
    }
  }

  // ------------------------------
  // Auto-detect reporter email from fields or description
  // ------------------------------
  function resolveReporterEmail(fields) {
    console.log("\n🔍 Scanning fields for email...");

    // 1️⃣ Try reporter / creator fields
    if (fields.reporter?.emailAddress) {
      console.log(`👤 Reporter email found: ${fields.reporter.emailAddress}`);
      return fields.reporter.emailAddress;
    }

    if (fields.creator?.emailAddress) {
      console.log(`👤 Creator email found: ${fields.creator.emailAddress}`);
      return fields.creator.emailAddress;
    }

    // 2️⃣ Try custom or possible fields (commonly used in JSM)
    const possibleFields = [
      "customfield_10024",
      "customfield_10038",
      "customfield_10041",
      "customfield_10042",
    ];

    for (const field of possibleFields) {
      const value = fields[field];
      if (typeof value === "string" && value.includes("@")) {
        console.log(`📧 Auto-detected email in ${field}: ${value}`);
        return value;
      }
      if (Array.isArray(value)) {
        const found = value.find((v) => v?.emailAddress);
        if (found) {
          console.log(`📧 Auto-detected email in ${field} array: ${found.emailAddress}`);
          return found.emailAddress;
        }
      }
    }

    // 3️⃣ Try scanning description for an email line like “Reporter Email: someone@mail.com”
    const description = fields.description || "";
    if (typeof description === "string" && description.includes("@")) {
      const match = description.match(/Reporter Email:\s*([^\s]+)/i);
      if (match && match[1]) {
        const cleanEmail = match[1].trim();
        console.log(`📧 Found reporter email in description: ${cleanEmail}`);
        return cleanEmail;
      }
    }

    // 4️⃣ As last resort, loop through all fields
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === "string" && value.includes("@")) {
        console.log(`📧 Detected possible email in ${key}: ${value}`);
        return value;
      }
      if (typeof value === "object" && value?.emailAddress) {
        console.log(`📧 Detected possible email in ${key}.emailAddress: ${value.emailAddress}`);
        return value.emailAddress;
      }
    }

    console.warn("⚠️ No valid email found in any field or description.");
    return null;
  }

  try {
    const payload = req.body;

    // 1️⃣ Verify webhook secret
    const webhookSecret = process.env.JIRA_WEBHOOK_SECRET;
    const receivedSecret =
      req.headers["x-jira-webhook-secret"] || req.headers["x-atlassian-webhook-secret"];

    if (webhookSecret && receivedSecret && webhookSecret !== receivedSecret) {
      console.warn("⚠️ Webhook secret mismatch");
      return res.status(403).send("Forbidden: invalid secret");
    }

    // 2️⃣ Detect status change
    const statusChange = payload.changelog?.items?.find((item) => item.field === "status");
    if (!statusChange) {
      console.log("ℹ️ No status change detected for issue", payload.issue?.key);
      return res.status(200).send("No status change detected");
    }

    const issueKey = payload.issue.key;
    const oldStatus = statusChange.fromString || statusChange.from || "Unknown";
    const newStatus = statusChange.toString || statusChange.to || "Unknown";

    // 3️⃣ Detect the reporter email intelligently
    let reporterEmail = resolveReporterEmail(payload.issue.fields);

    // 4️⃣ If still not found, fetch from Jira API
    if (!reporterEmail && payload.issue.fields.reporter?.accountId) {
      reporterEmail = await getJiraUserEmail(payload.issue.fields.reporter.accountId);
    }

    // 5️⃣ Cleanup email (avoid "No recipients defined")
    if (reporterEmail) {
      reporterEmail = reporterEmail.replace(/[<>]/g, "").trim();
    }

    if (!reporterEmail || !reporterEmail.includes("@")) {
      console.warn(`❌ Reporter email not found or invalid for issue ${issueKey}`);
      return res.status(200).send("No reporter email found");
    }

    console.log(`✅ Reporter email resolved: ${reporterEmail}`);

    // 6️⃣ Respond immediately
    res.status(200).send("Received");

    // 7️⃣ Send the email asynchronously
    setImmediate(async () => {
      try {
        await sendEmail({
          from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
          to: reporterEmail,
          subject: `Update on your Request [${issueKey}]`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; color: #333;">
              <div style="background-color: #1a73e8; color: #fff; padding: 20px; text-align: center;">
                <h1 style="margin:0; font-size: 20px;">Cloud Sentrics Support</h1>
              </div>
              <div style="padding: 20px; line-height: 1.6;">
                <p>Dear Client,</p>
                <p>Your request <strong>${issueKey}</strong> has changed from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>
                <p>You will be notified of further updates as progress continues.</p>
                <br/>
                <p>Kind regards,</p>
                <p><strong>Cloud Sentrics Support Team</strong><br/>
                <a href="mailto:customersupport@cloudsentrics.org" style="color:#1a73e8;">customersupport@cloudsentrics.org</a><br/>
                <a href="https://www.cloudsentrics.org" style="color:#1a73e8;">www.cloudsentrics.org</a></p>
              </div>
            </div>
          `,
        });

        console.log(`✅ Status update email sent for ${issueKey}: ${oldStatus} → ${newStatus}`);
      } catch (mailErr) {
        console.error("❌ Email sending error:", mailErr);
      }
    });
  } catch (err) {
    console.error("❌ Error handling Jira webhook:", err);
    res.status(500).send("Webhook processing error");
  }
};
