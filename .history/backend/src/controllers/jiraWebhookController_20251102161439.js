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
        `https://info4cloudsentrics.atlassian.net/rest/api/3/user?accountId=${accountId}`,
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

    // 2️⃣ Try common custom fields
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

    // 3️⃣ Try scanning description for “Reporter Email: ...”
    const description = fields.description || "";
    if (typeof description === "string" && description.includes("@")) {
      const match = description.match(/Reporter Email:\s*([^\s]+)/i);
      if (match && match[1]) {
        const cleanEmail = match[1].trim();
        console.log(`📧 Found reporter email in description: ${cleanEmail}`);
        return cleanEmail;
      }
    }

    // 4️⃣ Try summary or description for "Issue Reported by (email)"
    const summary = fields.summary || "";
    const combinedText = `${summary}\n${description}`;
    const embeddedEmail = combinedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/);
    if (embeddedEmail) {
      console.log(`📧 Found embedded email in summary/description: ${embeddedEmail[0]}`);
      return embeddedEmail[0];
    }

    // 5️⃣ Last resort: search all fields
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

    console.warn("⚠️ No valid email found in any field or text.");
    return null;
  }

  // ------------------------------
  // Template map (exact content you provided)
  // ------------------------------
  const templates = {
    request: {
      "In Progress": {
        subject: "Your Ticket [#{{ticket_id}}] Is Now In Progress",
        body: `Dear {{ClientName}},
We wanted to let you know that your ticket (ID: {{ticket_id}}) has now been assigned to one of our engineers and is currently being worked on.
You can expect updates as progress is made, or once the request has been fully provisioned.
Thank you for your continued cooperation.
Best regards,

Cloud Sentrics Support Team
Cloud Sentrics Limited
customersupport@cloudsentrics.org 
www.cloudsentrics.org`,
      },
      Blocked: {
        subject: "Action Required: Additional Information Needed for Ticket [#{{ticket_id}}]",
        body: `Dear {{ClientName}},
We are currently working on your request (Ticket ID: {{ticket_id}}) but need additional information to proceed.
Someone from our support team will reach out to you for further information.
Thank you for your prompt attention to this matter.
Warm regards,

Cloud Sentrics Support Team
Cloud Sentrics Limited
customersupport@cloudsentrics.org 
www.cloudsentrics.org`,
      },
      Done: {
        subject: "Your Request Has Been Completed – [Ticket #{{ticket_id}}]",
        body: `Dear {{ClientName}},
We’re pleased to inform you that your request (Ticket ID: {{ticket_id}}) has been successfully Completed.
Please reach out to us for any questions or concerns regarding this ticket.
Thank you for choosing Cloud Sentrics Limited, we appreciate your trust in our services.
Best regards,

Cloud Sentrics Support Team
Cloud Sentrics Limited
customersupport@cloudsentrics.org 
www.cloudsentrics.org`,
      },
    },
    report: {
      Received: {
        subject: "Your Issue Has Been Received – [Ticket #{{ticket_id}}]",
        body: `Dear {{ClientName}},
Thank you for contacting Cloud Sentrics Limited.
We have received your issue (Ticket ID: {{ticket_id}}) and one of our engineers will be assigned shortly to review your case.
We appreciate your patience as we work to resolve this as quickly as possible.
You will receive another update once your ticket has been assigned to an engineer.
Kind regards,

Cloud Sentrics Support Team
Cloud Sentrics Limited
customersupport@cloudsentrics.org 
www.cloudsentrics.org`,
      },
      "In Progress": {
        subject: "Your Ticket [#{{ticket_id}}] Is Now In Progress",
        body: `Dear {{ClientName}},
We wanted to let you know that your ticket (ID: {{ticket_id}}) has now been assigned to one of our engineers and is currently being worked on.
You can expect updates as progress are made, or once the issue has been fully resolved.
Thank you for your continued cooperation.
Best regards,

Cloud Sentrics Support Team
Cloud Sentrics Limited
customersupport@cloudsentrics.org 
www.cloudsentrics.org`,
      },
      Blocked: {
        subject: "Action Required: Additional Information Needed for Ticket [#{{ticket_id}}]",
        body: `Dear {{ClientName}},
We are currently working on your issue (Ticket ID: {{ticket_id}}) but need additional information to proceed.
Someone from our support team will reach out to you for further information
Thank you for your prompt attention to this matter.
Warm regards,

Cloud Sentrics Support Team
Cloud Sentrics Limited
customersupport@cloudsentrics.org 
www.cloudsentrics.org`,
      },
      Done: {
        subject: "Your Issue Has Been Resolved – [Ticket #{{ticket_id}}]",
        body: `Dear {{ClientName}},
We’re pleased to inform you that your issue (Ticket ID: {{ticket_id}}) has been successfully Resolved.
Please reach out to us for any questions or concerns regarding this ticket.
Thank you for choosing Cloud Sentrics Limited, we appreciate your trust in our services.
Best regards,

Cloud Sentrics Support Team
Cloud Sentrics Limited
customersupport@cloudsentrics.org 
www.cloudsentrics.org`,
      },
    },
  };

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
    const oldStatus = statusChange.fromString || "Unknown";
    const newStatus = statusChange.toString || "Unknown";

    // 3️⃣ Identify issue type
    const issueTypeRaw = payload.issue.fields.issuetype?.name || "Issue";
    const isReport = issueTypeRaw.toLowerCase().includes("report");
    const kind = isReport ? "report" : "request";

    // 4️⃣ Detect reporter email intelligently
    let reporterEmail = resolveReporterEmail(payload.issue.fields);

    // 5️⃣ If still not found, try Jira API lookup
    if (!reporterEmail && payload.issue.fields.reporter?.accountId) {
      reporterEmail = await getJiraUserEmail(payload.issue.fields.reporter.accountId);
    }

    // 6️⃣ Cleanup
    if (reporterEmail) {
      reporterEmail = reporterEmail.replace(/[<>]/g, "").trim();
    }

    // 7️⃣ Determine recipient; if report and no personal email, fallback to REPORT_TEAM_EMAIL
    const recipient =
      kind === "report"
        ? reporterEmail || process.env.REPORT_TEAM_EMAIL || "reports@cloudsentrics.org"
        : reporterEmail;

    if (!recipient || !recipient.includes("@")) {
      console.warn(`❌ Recipient email not found or invalid for issue ${issueKey}`);
      return res.status(200).send("No valid email found");
    }

    // 8️⃣ Build client name: prefer reporter.displayName, then email local-part
    let clientName =
      payload.issue.fields.reporter?.displayName ||
      payload.issue.fields.creator?.displayName ||
      null;
    if (!clientName && reporterEmail) {
      clientName = reporterEmail.split("@")[0];
    }
    clientName = clientName || "Client";

    console.log(`✅ Recipient resolved: ${recipient} (ClientName: ${clientName})`);

    // 9️⃣ Select template
    // Normalize statuses (Jira may use different casings)
    const normalizedStatus = (() => {
      if (!newStatus) return newStatus;
      return newStatus.trim();
    })();

    const tplGroup = templates[kind] || templates.request;
    const tpl = tplGroup[normalizedStatus];

    // Special-case: Received status for requests might not be used; user earlier used Received for reports only.
    if (!tpl) {
      // fallback: use a generic template
      console.warn(`⚠️ No template found for kind='${kind}', status='${normalizedStatus}'. Using generic message.`);
    }

    // 10️⃣ Extract InformationNeeded (optional)
    // Try common custom fields and also the webhook comment if present
    let infoNeeded = null;
    const possibleInfoFields = ["customfield_10042", "customfield_10041", "customfield_10038"];
    for (const f of possibleInfoFields) {
      const v = payload.issue.fields?.[f];
      if (v && typeof v === "string" && v.trim()) {
        infoNeeded = v.trim();
        break;
      }
    }
    // try comment body if present (some webhooks include comment)
    if (!infoNeeded && payload.comment?.body) {
      infoNeeded = payload.comment.body.trim();
    }

    // 11️⃣ Build subject/body (use template if available, otherwise generic)
    let subject;
    let bodyText;
    if (tpl) {
      subject = tpl.subject.replace(/{{ticket_id}}/g, issueKey);
      bodyText = tpl.body
        .replace(/{{ticket_id}}/g, issueKey)
        .replace(/{{ClientName}}/g, clientName);
      if (tpl.body.includes("{{InformationNeeded}}")) {
        if (infoNeeded) {
          bodyText = bodyText.replace(/{{InformationNeeded}}/g, infoNeeded);
        } else {
          // remove the bullet line if no info provided
          bodyText = bodyText.replace(/\n?•\s*{{InformationNeeded}}\s*/g, "");
        }
      }
    } else {
      // Generic fallback
      subject = `Update on your ${issueTypeRaw} [${issueKey}]`;
      bodyText = `Dear ${clientName},\n\nYour ${issueTypeRaw} ${issueKey} changed from ${oldStatus} to ${newStatus}.\n\nKind regards,\n\nCloud Sentrics Support Team\nCloud Sentrics Limited\ncustomersupport@cloudsentrics.org`;
    }

    // 12️⃣ Prepare HTML from bodyText preserving line breaks
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #333;">
        <div style="background-color:#1a73e8; color:#fff; padding:16px; text-align:center;">
          <h2 style="margin:0">Cloud Sentrics Support</h2>
        </div>
        <div style="padding:18px; line-height:1.6;">
          ${bodyText.split("\n").map((line) => `<p style="margin:6px 0;">${line || "&nbsp;"}</p>`).join("")}
          <hr style="margin:18px 0;"/>
          <p style="font-size:13px;color:#666;">This is an automated message from Cloud Sentrics Limited.</p>
        </div>
      </div>
    `;

    // 13️⃣ Respond quickly to Jira
    res.status(200).send("Received");

    // 14️⃣ Send email asynchronously
    setImmediate(async () => {
      try {
        await sendEmail({
          from: `"Cloud Sentrics Support" <${process.env.EMAIL_USER}>`,
          to: recipient,
          subject,
          html: htmlBody,
        });

        console.log(`✅ ${issueTypeRaw} email sent for ${issueKey}: ${oldStatus} → ${newStatus}`);
      } catch (mailErr) {
        console.error("❌ Email sending error:", mailErr);
      }
    });
  } catch (err) {
    console.error("❌ Error handling Jira webhook:", err);
    res.status(500).send("Webhook processing error");
  }
};
