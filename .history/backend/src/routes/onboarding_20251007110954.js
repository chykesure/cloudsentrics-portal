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

// Helper: Wrap transporter.sendMail in a Promise
function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return reject(error);
      resolve(info);
    });
  });
}

// ✅ POST /api/onboarding (create new onboarding)
router.post("/", async (req, res) => {
  try {
    console.log("Received onboarding request:", req.body);

    const { companyInfo, awsSetup, agreements = {} } = req.body;

    if (!companyInfo || !awsSetup) {
      console.error("Missing required fields:", { companyInfo, awsSetup });
      return res.status(400).json({ error: "Missing required fields: companyInfo or awsSetup" });
    }

    const customerId = generateCustomerId();
    const createdAt = new Date();

    const newOnboarding = new Onboarding({
      companyInfo,
      awsSetup,
      agreements,
      customerId,
      createdAt,
    });

    await newOnboarding.save();
    console.log("✅ Onboarding saved successfully:", newOnboarding);

    // Send confirmation email
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

    sendEmail(mailOptions)
      .then(info => console.log("✉️ Email sent:", info.response))
      .catch(err => console.error("⚠️ Error sending email:", err));

    res.status(201).json({ message: "Onboarding saved", customerId });
  } catch (error) {
    console.error("❌ Error processing onboarding request:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ✅ PUT /api/onboarding/:email (update onboarding profile info)
router.put("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { primaryName, companyEmail, primaryPhone } = req.body;

    const updated = await Onboarding.findOneAndUpdate(
      { "companyInfo.companyEmail": email },
      {
        $set: {
          "companyInfo.primaryName": primaryName,
          "companyInfo.companyEmail": companyEmail,
          "companyInfo.primaryPhone": primaryPhone,
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found in onboarding records" });
    }

    console.log("✅ Profile updated:", updated.companyInfo);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updated.companyInfo,
    });
  } catch (error) {
    console.error("❌ Error updating onboarding:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

module.exports = router;
