const nodemailer = require("nodemailer");
const Onboarding = require("../models/Onboarding");

// create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// helper function to send email
const sendEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
};

const createOnboarding = async (req, res) => {
  try {
    const { userId, companyInfo, awsSetup, agreements } = req.body;

    // Validation
    if (!userId || !companyInfo || !awsSetup || !agreements) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        details: {
          userId: !userId ? "User ID is required" : null,
          companyInfo: !companyInfo ? "Company info is missing" : null,
          awsSetup: !awsSetup ? "AWS setup is missing" : null,
          agreements: !agreements ? "Agreements are missing" : null,
        },
      });
    }

    // Create onboarding
    const newOnboarding = new Onboarding({
      userId,
      companyInfo,
      awsSetup,
      agreements,
    });

    await newOnboarding.save();

    // Email
    const mailOptions = {
      from: `"Cloud Sentrics" <${process.env.EMAIL_USER}>`,
      to: companyInfo.companyEmail,
      subject: "Your Cloud Sentrics Customer ID",
      html: `<p>Hi ${companyInfo.primaryName || "User"},</p>
             <p>Thank you for completing onboarding. Your Customer ID is: <strong>${newOnboarding.customerId}</strong></p>
             <p>Keep this for your records.</p>`,
    };

    await sendEmail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "Onboarding saved successfully",
      customerId: newOnboarding.customerId,
    });
  } catch (err) {
    console.error("Onboarding error:", err);

    // Handle duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry detected",
        details: err.keyValue, // e.g. { userId: null }
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


module.exports = { createOnboarding };
