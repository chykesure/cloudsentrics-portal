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

    if (!userId || !companyInfo || !awsSetup || !agreements) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOnboarding = new Onboarding({
      userId,
      companyInfo,
      awsSetup,
      agreements,
    });

    await newOnboarding.save();

    const mailOptions = {
      from: `"Cloud Sentrics" <${process.env.EMAIL_USER}>`,
      to: companyInfo.companyEmail,
      subject: "Your Cloud Sentrics Customer ID",
      html: `<p>Hi ${companyInfo.primaryName || "User"},</p>
             <p>Thank you for completing onboarding. Your Customer ID is: <strong>${newOnboarding.customerId}</strong></p>`,
    };

    await sendEmail(mailOptions);

    res.status(201).json({
      success: true,
      customerId: newOnboarding.customerId,
      message: "Onboarding saved",
    });

  } catch (err) {
    console.error("Error processing onboarding request:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Duplicate entry: This user has already completed onboarding.",
      });
    }

    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


module.exports = { createOnboarding };
