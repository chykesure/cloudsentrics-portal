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
  // Internal function to fetch Jira user email by accountId
  // ------------------------------
  async function getJiraUserEmail(accountId) {
    try {
      const response = await axios.get(
        `https://polycarpchike.atlassian.net/rest/api/3/user?accountId=${accountId}`,
        {
          auth: {
            username: process.env.JIRA_EMAIL,       // your Jira API user email
            password: process.env.JIRA_API_TOKEN,  // Jira API token
          },
        }
      );
      return response.data.emailAddress || null;
    } catch (err) {
      console.error(
        "❌ Failed to fetch Jira user email:",
        err.response?.data || err.message
      );
      return null;
    }
  }

  try {
    const payload = req.body;

    // 1️⃣ Verify webhook secret
    const webhookSecret = process.env.JIRA_WEBHOOK_SECRET;
    const receivedSecret =
      req.headers["x-jira-webhook-secret"] ||
      req.headers["x-atlassian-webhook-secret"];

    if (webhookSecret && receivedSecret && webhookSecret !== receivedSecret) {
      console.warn("Webhook secret mismatch");
      return res.status(403).send("Forbidden: invalid secret");
    }

    // 2️⃣ Detect status change
    const statusChange = payload.changelog?.items?.find(
      (item) => item.field === "status"
    );

    if (!statusChange) {
      console.log(
        "No status change detected for issue",
        payload.issue?.key
      );
      return res.status(200).send("No status change detected");
    }

    const issueKey = payload.issue.key;
    const oldStatus = statusChange.fromString || statusChange.from || "Unknown";
    const newStatus = statusChange.toString || statusChange.to || "Unknown";

    // 3️⃣ Determine reporter email
    let reporterEmail = null;

// Try reporter first
if (payload.issue.fields.reporter) {
  reporterEmail =
    payload.issue.fields.reporter.emailAddress ||
    (payload.issue.fields.reporter.accountId
      ? await getJiraUserEmail(payload.issue.fields.reporter.accountId)
      : null);
}

// If reporter not available, fallback to creator
if (!reporterEmail && payload.issue.fields.creator) {
  reporterEmail =
    payload.issue.fields.creator.emailAddress ||
    (payload.issue.fields.creator.accountId
      ? await getJiraUserEmail(payload.issue.fields.creator.accountId)
      : null);
}


    if (!reporterEmail) {
      console.warn(
        `Reporter email missing for issue ${issueKey} (skipping email)`
      );
      return res.status(200).send("No reporter email available");
    }

    // 4️⃣ Immediately acknowledge webhook
    res.status(200).send("Received");

    // 5️⃣ Send email asynchronously
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

        console.log(
          `✅ Status update email sent for ${issueKey}: ${oldStatus} → ${newStatus}`
        );
      } catch (mailErr) {
        console.error("❌ Email sending error:", mailErr);
      }
    });
  } catch (err) {
    console.error("❌ Error handling Jira webhook:", err);
    res.status(500).send("Webhook processing error");
  }
};
