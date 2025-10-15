const nodemailer = require("nodemailer");
const { htmlToText } = require("html-to-text"); // converts HTML to plain text automatically

// Load env
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST || "smtp.hostinger.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("❌ EMAIL_USER or EMAIL_PASS not set in .env");
}

console.log("📧 Using SMTP config:", {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  user: EMAIL_USER,
});

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// Verify transporter
transporter.verify((err) => {
  if (err) console.error("❌ Mail transporter verification failed:", err.message || err);
  else console.log("✅ Mail transporter ready");
});

/**
 * Sends email with HTML and automatically generated plain-text fallback.
 * @param {string} to Recipient email
 * @param {string} subject Email subject
 * @param {string} html HTML content
 */
async function sendEmail(to, subject, html) {
  const text = htmlToText(html, {
    wordwrap: 130,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } }
    ]
  });

  const info = await transporter.sendMail({
    from: `"Cloudsentrics Support" <${EMAIL_USER}>`,
    to,
    subject,
    text,  // auto-generated plain-text fallback
    html,  // HTML version
  });

  console.log("✅ Email sent:", info.messageId);
  return info;
}

module.exports = { sendEmail };
