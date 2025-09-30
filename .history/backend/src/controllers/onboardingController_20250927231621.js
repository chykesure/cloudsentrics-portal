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

    // create and save onboarding
    const newOnboarding = new Onboarding({
      userId,
      companyInfo,
      awsSetup,
      agreements,
      // customerId will be auto-generated in the model
    });

    await newOnboarding.save();

    // prepare email
    const mailOptions = {
      from: `"Cloud Sentrics" <${process.env.EMAIL_USER}>`,
      to: companyInfo.companyEmail,
      subject: "Your Cloud Sentrics Customer ID",
      html: `<p>Hi ${companyInfo.primaryName || "User"},</p>
             <p>Thank you for completing onboarding. Your Customer ID is: <strong>${newOnboarding.customerId}</strong></p>
             <p>Keep this for your records.</p>`,
    };

    // send email and wait for completion
    await sendEmail(mailOptions);

    res.status(201).json({ message: "Onboarding saved", customerId: newOnboarding.customerId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createOnboarding };
