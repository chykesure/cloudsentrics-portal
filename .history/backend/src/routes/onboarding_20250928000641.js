const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Onboarding = require("../models/Onboarding");

// Helper function to generate Customer ID
function generateCustomerId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CS-${randomStr}`;
}

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Wrap transporter.sendMail in a Promise
function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return reject(error);
      resolve(info);
    });
  });
}

// POST /api/onboarding
router.post("/", async (req, res) => {
  try {
    console.log("Received onboarding request:", req.body);

    const { companyInfo, awsSetup, agreements = {} } = req.body;

    // Basic validation for required top-level fields
    if (!companyInfo || !awsSetup) {
      console.error("Missing required fields:", { companyInfo, awsSetup });
      return res.status(400).json({ error: "Missing required fields: companyInfo or awsSetup" });
    }

    // Customer ID is always generated internally
    const customerId = generateCustomerId();
    const createdAt = new Date();

    // Create onboarding object
    const newOnboarding = new Onboarding({
      companyInfo,
      awsSetup,
      agreements,
      customerId,
      createdAt,
    });

    await newOnboarding.save();
    console.log("Onboarding saved successfully:", newOnboarding);

    // Prepare email
    const mailOptions = {
      from: `"Cloud Sentrics" <${process.env.EMAIL_USER}>`,
      to: companyInfo.companyEmail,
      subject: "Your Cloud Sentrics Customer ID",
      html: `
        <h2>Welcome to Cloud Sentrics!</h2>
        <p>Hi ${companyInfo.primaryName || companyInfo.companyName},</p>
        <p>Your onboarding has been successfully completed.</p>
        <p><strong>Your Customer ID:</strong> ${customerId}</p>
        <p>Keep this ID safe; you will need it for future interactions.</p>
        <br/>
        <p>Thank you for choosing Cloud Sentrics.</p>
      `,
    };

    // Send email (doesn't block response)
    sendEmail(mailOptions)
      .then(info => console.log("Email sent:", info.response))
      .catch(err => console.error("Error sending email:", err));

    res.status(201).json({ message: "Onboarding saved", customerId });
  } catch (error) {
    console.error("Error processing onboarding request:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;
