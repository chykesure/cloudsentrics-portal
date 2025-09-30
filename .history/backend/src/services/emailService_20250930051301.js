// src/services/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g. smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS, // your app password
  },
});

/**
 * Send feedback email to user
 * @param {string} to - recipient email
 * @param {string} subject - subject line
 * @param {string} text - plain text body
 * @param {string} html - optional html body
 */
exports.sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Cloudsentrics Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
};
