// src/services/emailService.js
const nodemailer = require("nodemailer");

// Read env
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST; // optional
const SMTP_PORT = process.env.SMTP_PORT; // optional
const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // optional

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("Warning: EMAIL_USER or EMAIL_PASS not set in .env");
}

// Build transporter: prefer explicit SMTP_HOST if provided, otherwise fall back to Gmail service config
const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: SMTP_SECURE || (SMTP_PORT === "465"), // true for 465
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    })
  : nodemailer.createTransport({
      service: "gmail", // fallback (works if EMAIL_USER is Gmail and you have an app password)
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

// Optional: verify transporter on start
transporter.verify((err, success) => {
  if (err) {
    console.warn("Mail transporter verification failed:", err.message || err);
  } else {
    console.log("Mail transporter ready");
  }
});

/**
 * Send an email.
 * @param {string} to - recipient email (or comma-separated list)
 * @param {string} subject
 * @param {string} text - plain text body
 * @param {string} [html] - optional html body
 */
async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Cloudsentrics Support" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    // bubble up error so controller can optionally react/log
    throw err;
  }
}

module.exports = { sendEmail };
