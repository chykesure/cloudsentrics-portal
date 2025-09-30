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

    // send email to user
    const mailOptions = {
      from: `"Cloud Sentrics" <${process.env.EMAIL_USER}>`,
      to: companyInfo.companyEmail, // email from form
      subject: "Your Cloud Sentrics Customer ID",
      html: `<p>Hi ${companyInfo.primaryName || "User"},</p>
             <p>Thank you for completing onboarding. Your Customer ID is: <strong>${newOnboarding.customerId}</strong></p>
             <p>Keep this for your records.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(201).json({ message: "Onboarding saved", customerId: newOnboarding.customerId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createOnboarding };
