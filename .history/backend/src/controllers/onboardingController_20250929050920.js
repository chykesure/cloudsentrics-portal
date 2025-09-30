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

        if (!companyInfo || !awsSetup || !agreements) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // ✅ normalize email before saving
        if (companyInfo.companyEmail) {
            companyInfo.companyEmail = companyInfo.companyEmail.toLowerCase().trim();
        }

        // check if companyEmail already exists
        const existing = await Onboarding.findOne({
            "companyInfo.companyEmail": companyInfo.companyEmail,
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error:
                    "Duplicate entry: This company email has already completed onboarding.",
            });
        }

        // create onboarding document
        const newOnboarding = new Onboarding({
            companyInfo,
            awsSetup,
            agreements,
        });

        await newOnboarding.save();

        // send confirmation email
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

        await sendEmail(mailOptions);

        return res.status(201).json({
            success: true,
            message: "Onboarding saved successfully",
            customerId: newOnboarding.customerId,
        });
    } catch (err) {
        console.error("Error in createOnboarding:", err);

        if (err.code && err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0]; // e.g. "companyInfo.companyEmail"
            const value = err.keyValue[field];            // e.g. "polycarpchike@gmail.com"

            return res.status(400).json({
                success: false,
                error: `Duplicate entry: The ${field} "${value}" is already registered.`,
            });
        }

        return res.status(500).json({
            success: false,
            error: err.message || "Internal server error",
        });
    }
};

module.exports = { createOnboarding };
