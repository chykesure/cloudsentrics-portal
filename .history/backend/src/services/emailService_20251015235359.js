// src/services/emailService.js
const nodemailer = require("nodemailer");

// Read env
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

// Always Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error("❌ Mail transporter verification failed:", err.message || err);
  } else {
    console.log("✅ Mail transporter ready");
  }
});

async function sendEmail(to, subject, text, html) {
  const info = await transporter.sendMail({
    from: `"Cloudsentrics Support" <${EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
  console.log("✅ Email sent:", info.messageId);
  return info;
}

module.exports = { sendEmail };
