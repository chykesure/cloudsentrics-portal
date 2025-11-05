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

// Helper for sending email
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
    const { companyInfo, awsSetup, agreements = {} } = req.body;

    if (!companyInfo || !awsSetup) {
      return res.status(400).json({ error: "Missing required fields: companyInfo or awsSetup" });
    }

    if (companyInfo.companyEmail) {
      companyInfo.companyEmail = companyInfo.companyEmail.toLowerCase().trim();
    }

    const existing = await Onboarding.findOne({
      "companyInfo.companyEmail": companyInfo.companyEmail,
    });
    if (existing) {
      return res.status(400).json({
        error: `Duplicate entry: The email "${companyInfo.companyEmail}" is already registered.`,
      });
    }

    const customerId = generateCustomerId();
    const createdAt = new Date();

    const newOnboarding = new Onboarding({
      companyInfo,
      awsSetup,
      aliases, // ✅ add this
      agreements,
      customerId,
      createdAt,
    });

    await newOnboarding.save();

    // =====================================================
    // ✅ CONTACT SECTIONS
    // =====================================================
    const primaryContactBlock =
      companyInfo.primaryName || companyInfo.primaryEmail || companyInfo.primaryPhone
        ? `
      <div style="margin-top: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 6px;">
        <h3 style="color: #444;">Primary Contact:</h3>
        ${companyInfo.primaryName ? `<p><strong>Name:</strong> ${companyInfo.primaryName}</p>` : ""}
        ${companyInfo.primaryEmail ? `<p><strong>Email:</strong> ${companyInfo.primaryEmail}</p>` : ""}
        ${companyInfo.primaryPhone ? `<p><strong>Phone:</strong> ${companyInfo.primaryPhone}</p>` : ""}
      </div>`
        : "";

    const secondaryContactBlock =
      companyInfo.secondaryName || companyInfo.secondaryEmail || companyInfo.secondaryPhone
        ? `
      <div style="margin-top: 15px; background: #f8f9fa; padding: 10px 15px; border-radius: 6px;">
        <h3 style="color: #444;">Secondary Contact:</h3>
        ${companyInfo.secondaryName ? `<p><strong>Name:</strong> ${companyInfo.secondaryName}</p>` : ""}
        ${companyInfo.secondaryEmail ? `<p><strong>Email:</strong> ${companyInfo.secondaryEmail}</p>` : ""}
        ${companyInfo.secondaryPhone ? `<p><strong>Phone:</strong> ${companyInfo.secondaryPhone}</p>` : ""}
      </div>`
        : "";

    // =====================================================
    // ✅ AWS SETUP SECTION (STEP 2)
    // =====================================================
    const awsSetupBlock = `
      <div style="margin-top: 15px; background: #f1f9f1; padding: 10px 15px; border-radius: 6px;">
        <h3 style="color: #444;">AWS Setup Details:</h3>
        ${awsSetup.numberOfAccounts ? `<p><strong>Number of AWS Accounts Needed:</strong> ${awsSetup.numberOfAccounts}</p>` : ""}
        ${awsSetup.accountPurpose ? `<p><strong>Account Purpose:</strong> ${awsSetup.accountPurpose}</p>` : ""}
        ${awsSetup.region ? `<p><strong>Preferred AWS Region:</strong> ${awsSetup.region}</p>` : ""}
        ${awsSetup.services && awsSetup.services.length
        ? `<p><strong>Requested Services:</strong> ${awsSetup.services.join(", ")}</p>`
        : ""}
      </div>
    `;

    // =====================================================
    // ✅ AGREEMENT SECTION (STEP 3)
    // =====================================================
    const agreementBlock = `
  <div style="margin-top: 15px; background: #fffbe7; padding: 10px 15px; border-radius: 6px;">
    <h3 style="color: #444;">Agreements and Confirmations:</h3>
    ${agreements.agree ? "<p>✅ Accepted Terms & Conditions</p>" : "<p>❌ Terms not accepted</p>"}
    ${agreements.acknowledge ? "<p>✅ Acknowledged Policy</p>" : ""}
    ${agreements.confirm ? "<p>✅ Confirmed Information</p>" : ""}
    ${agreements.signedBy ? `<p><strong>Signed By:</strong> ${agreements.signedBy}</p>` : ""}
  </div>
`;

    // =====================================================
    // ✅ AWS ALIAS SECTION (NEW)
    // =====================================================
    const aliasBlock = aliases && Object.keys(aliases).length > 0
      ? `
    <div style="margin-top: 15px; background: #eaf3ff; padding: 10px 15px; border-radius: 6px;">
      <h3 style="color: #444;">Preferred AWS Aliases:</h3>
      <ul style="padding-left: 20px;">
        ${Object.entries(aliases)
        .map(
          ([key, value]) =>
            `<li><strong>${key}:</strong> cloudsentrics-aws-${value}</li>`
        )
        .join("")}
      </ul>
    </div>
  `
      : "";


    // =====================================================
    // ✅ USER EMAIL TEMPLATE
    // =====================================================
    const userMailOptions = {
      from: `"CloudSentrics" <${process.env.EMAIL_USER}>`,
      to: companyInfo.companyEmail,
      subject: "✅ Welcome to CloudSentrics! Your Customer ID",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 650px; margin: auto; color: #333;">
          <div style="text-align: center;">
            <img src="https://cloudsentrics.org/assets/logo.jpg" alt="CloudSentrics Logo" style="width: 120px; margin-bottom: 20px;" />
          </div>

          <h2 style="color: #333;">Hi ${companyInfo.primaryName || companyInfo.companyName || "User"},</h2>
          <p style="font-size: 16px;">Thank you for completing your onboarding with CloudSentrics! We’re thrilled to have you on board.</p>

          <div style="margin-top: 20px; font-size: 16px; background: #eef7ff; padding: 15px; border-radius: 8px;">
            <p><strong style="color:#007bff;">Your Customer ID is:</strong> <span style="font-weight:bold; color:#007bff;">${customerId}</span></p>
            <p><strong>Company Name:</strong> ${companyInfo.companyName}</p>
            <p><strong>Organization Email:</strong> ${companyInfo.companyEmail}</p>
          </div>

          ${primaryContactBlock}
          ${secondaryContactBlock}
          ${awsSetupBlock}
          ${aliasBlock}  // ✅ Add this line here
          ${agreementBlock}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999; text-align: center;">This email was automatically generated by <strong>CloudSentrics.org</strong>. Keep your Customer ID safe for future reference.</p>
        </div>
      `,
    };

    // =====================================================
    // ✅ ADMIN EMAIL TEMPLATE
    // =====================================================
    const adminMailOptions = {
      from: `"CloudSentrics Onboarding" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📨 New Onboarding Submission: ${companyInfo.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; max-width: 650px; margin: auto; color: #333;">
          <div style="text-align: center;">
            <img src="https://cloudsentrics.org/assets/logo.jpg" alt="CloudSentrics Logo" style="width: 120px; margin-bottom: 20px;" />
          </div>

          <h2 style="color: #333;">New Onboarding Completed</h2>
          <p style="font-size: 16px;">An organization has completed their onboarding process:</p>

          <div style="margin-top: 20px; font-size: 16px; background: #eef7ff; padding: 15px; border-radius: 8px;">
            <p><strong style="color:#007bff;">Customer ID:</strong> <span style="font-weight:bold; color:#007bff;">${customerId}</span></p>
            <p><strong>Company Name:</strong> ${companyInfo.companyName}</p>
            <p><strong>Organization Email:</strong> ${companyInfo.companyEmail}</p>
          </div>

          ${primaryContactBlock}
          ${secondaryContactBlock}
          ${awsSetupBlock}
          ${aliasBlock}
          ${agreementBlock}

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999; text-align: center;">This message was submitted via <strong>CloudSentrics Onboarding System</strong>.</p>
        </div>
      `,
    };

    // Send both emails concurrently
    try {
      await Promise.all([sendEmail(userMailOptions), sendEmail(adminMailOptions)]);
      console.log("✅ Emails sent successfully to user and admin");
    } catch (emailErr) {
      console.error("⚠️ Email sending failed:", emailErr.message);
    }

    res.status(201).json({ message: "Onboarding saved successfully", customerId });
  } catch (err) {
    console.error("❌ Onboarding error:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const value = Object.values(err.keyValue)[0];
      return res.status(400).json({
        error: `Duplicate entry: The ${field.replace("companyInfo.", "")} "${value}" is already registered.`,
      });
    }
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// GET /api/onboarding/company?email=...
router.get("/company", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email query parameter is required" });

    const company = await Onboarding.findOne({
      "companyInfo.companyEmail": email.toLowerCase().trim(),
    });

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.json(company);
  } catch (err) {
    console.error("❌ Error fetching company:", err);
    res.status(500).json({ message: "Server error while fetching company" });
  }
});

module.exports = router;
