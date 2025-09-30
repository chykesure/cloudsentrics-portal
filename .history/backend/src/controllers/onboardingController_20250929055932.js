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
        let { companyInfo, awsSetup, agreements } = req.body;

        // ✅ validation
        if (!companyInfo || !awsSetup || !agreements) {
            return res.status(400).json({
                success: false,
                error: "Missing required fields",
            });
        }

        // ✅ normalize email
        if (companyInfo.companyEmail) {
            companyInfo.companyEmail = companyInfo.companyEmail.toLowerCase().trim();
        }

        // ✅ check if companyEmail already exists
        const existing = await Onboarding.findOne({
            "companyInfo.companyEmail": companyInfo.companyEmail,
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: `Duplicate entry: The email "${companyInfo.companyEmail}" is already registered.`,
            });
        }

        // ✅ create onboarding document
        const newOnboarding = new Onboarding({
            companyInfo,
            awsSetup,
            agreements,
        });

        await newOnboarding.save();

        // ✅ build confirmation email
        const mailOptions = {
            from: `"Cloud Sentrics" <${process.env.EMAIL_USER}>`,
            to: companyInfo.companyEmail,
            subject: "Your Cloud Sentrics Customer ID",
            html: `
        <p>Hi ${companyInfo.primaryName || "User"},</p>
        <p>Thank you for completing onboarding.</p>
        <p>Your Customer ID is: <strong>${newOnboarding.customerId}</strong></p>
        <p>Please keep this for your records.</p>
      `,
        };

        // ✅ try sending email, but don’t block response if it fails
        try {
            await sendEmail(mailOptions);
            console.log("✅ Confirmation email sent successfully");
        } catch (emailErr) {
            console.error("⚠️ Failed to send confirmation email:", emailErr.message);
            // Don’t throw — onboarding is already saved
        }

        // ✅ return success (always if saved)
        return res.status(201).json({
            success: true,
            message: "Onboarding saved successfully",
            customerId: newOnboarding.customerId,
        });

    } catch (err) {
        console.error("❌ Error processing onboarding request:", err);

        // ✅ handle Mongo duplicate key error (extra safety)
        if (
            err.code === 11000 ||
            (err.errorResponse && err.errorResponse.code === 11000)
        ) {
            const field = Object.keys(err.keyPattern || {})[0];
            const value =
                (err.keyValue && err.keyValue[field]) ||
                (err.errorResponse?.keyValue && Object.values(err.errorResponse.keyValue)[0]) ||
                "";

            return res.status(400).json({
                success: false,
                error: `Duplicate entry: The ${field.replace("companyInfo.", "")} "${value}" is already registered.`,
            });
        }

    }
};

module.exports = { createOnboarding };
