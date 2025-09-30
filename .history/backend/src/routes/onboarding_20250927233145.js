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

// Wrap transporter.sendMail in a Promise for async/await
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
    const { companyInfo, awsSetup, agreements, userId } = req.body;

    if (!companyInfo || !awsSetup || !agreements || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if at least one alias is filled
    const aliasesProvided =
      awsSetup.aliases && Object.values(awsSetup.aliases).some(val => val.trim() !== "");
    const extraAliasesProvided = awsSetup.extraAliases && awsSetup.extraAliases.trim() !== "";

    if (!aliasesProvided && !extraAliasesProvided) {
      // Optional: You can remove this check entirely if even empty aliases are fine
      console.warn("No AWS aliases provided, but still proceeding.");
    }

    const customerId = generateCustomerId();
    const createdAt = new Date();

    const newOnboarding = new Onboarding({
      companyInfo,
      awsSetup,
      agreements,
      userId,
      customerId,
      createdAt,
    });

    await newOnboarding.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

    await sendEmail(mailOptions);

    res.status(201).json({ message: "Onboarding saved and email sent", customerId });
  } catch (error) {
    console.error("Error saving onboarding or sending email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
