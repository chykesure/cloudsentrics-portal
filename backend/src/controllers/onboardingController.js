// backend/src/controllers/onboardingController.js
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");   // <-- REQUIRED
const Onboarding = require("../models/Onboarding");
const User = require("../models/User");


// ===============================
// 📧 Create mail transporter
// ===============================
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ===============================
// ✉️ Helper to send email (Promise-based)
// ===============================
const sendEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    });
  });
};

// ===============================
// 🧩 Main Controller: createOnboarding
// ===============================
const createOnboarding = async (req, res) => {
  try {
    let { companyInfo, awsSetup, agreements } = req.body;

    // ✅ Validation
    if (!companyInfo || !awsSetup || !agreements) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // ✅ Normalize email
    if (companyInfo.companyEmail) {
      companyInfo.companyEmail = companyInfo.companyEmail.toLowerCase().trim();
    }

    // ✅ Check for duplicate company email
    const existing = await Onboarding.findOne({ "companyInfo.companyEmail": companyInfo.companyEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Duplicate entry: The email "${companyInfo.companyEmail}" is already registered.`
      });
    }

    // ✅ Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12-char temp password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ✅ Create onboarding record with credentials
    const newOnboarding = new Onboarding({
      companyInfo,
      awsSetup,
      agreements,
      passwordHash: hashedPassword,
      tempPassword,           // store for email
      mustChangePassword: true,
      role: "User"            // default role
    });

    await newOnboarding.save();

    // ===============================
    // 📧 Email to User
    // ===============================
    const userMailOptions = {
      from: `"CloudSentrics" <${process.env.EMAIL_USER}>`,
      to: companyInfo.companyEmail,
      subject: "✅ Welcome to CloudSentrics! Your Customer ID & Temporary Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; color: #333;">
          <div style="text-align: center;">
            <img src="https://cloudsentrics.org/assets/logo.jpg" alt="CloudSentrics Logo" style="width: 120px; margin-bottom: 20px;" />
          </div>
          <h2>Hi ${companyInfo.primaryName || "User"},</h2>
          <p>Thank you for completing your onboarding with CloudSentrics! We’re excited to have you on board.</p>
          <p><strong>Your Customer ID:</strong> ${newOnboarding.customerId}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p>Please login and change your password immediately for security.</p>
        </div>
      `
    };

    // ===============================
    // 📧 Email to Admins
    // ===============================
    const adminMailOptions = {
      from: `"CloudSentrics Onboarding" <${process.env.EMAIL_USER}>`,
      to: [process.env.EMAIL_USER, "onboarding@cloudsentrics.org"],
      subject: "📨 New Onboarding Submission",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; color: #333;">
          <h2>New Onboarding Completed</h2>
          <p>An organization has completed onboarding:</p>
          <div style="margin-top: 20px;">
            <p><strong>Name:</strong> ${companyInfo.primaryName || "N/A"}</p>
            <p><strong>Company:</strong> ${companyInfo.companyName || "N/A"}</p>
            <p><strong>Email:</strong> ${companyInfo.companyEmail}</p>
            <p><strong>Phone:</strong> ${companyInfo.primaryPhone || "N/A"}</p>
            <p><strong>Customer ID:</strong> ${newOnboarding.customerId}</p>
          </div>
        </div>
      `
    };

    // ✅ Send emails in parallel
    try {
      await Promise.all([sendEmail(userMailOptions), sendEmail(adminMailOptions)]);
      console.log("✅ Emails sent successfully to user and admins");
    } catch (emailErr) {
      console.error("⚠️ Failed to send email(s):", emailErr.message);
    }

    // ✅ Return response
    return res.status(201).json({
      success: true,
      message: "Onboarding saved successfully. A temporary password has been sent to your email.",
      customerId: newOnboarding.customerId,
    });

  } catch (err) {
    console.error("❌ Onboarding error:", err);

    // Mongoose validation errors
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: `Validation failed: ${messages.join(", ")}` });
    }

    return res.status(500).json({ success: false, error: "An unexpected error occurred." });
  }
};


// ===============================
// 🧩 Get company info by email
// ===============================
const getCompanyByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email query parameter is required" });
    }

    const company = await Onboarding.findOne({ "companyInfo.companyEmail": email.toLowerCase().trim() });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (err) {
    console.error("❌ Error fetching company:", err);
    res.status(500).json({ message: "Server error while fetching company" });
  }
};

// ===============================
// 🧩 Get All Onboarded Customers
// ===============================
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Onboarding.find({})
      .sort({ createdAt: -1 })
      .select(
        "customerId companyInfo awsSetup aliases agreements createdAt updatedAt"
      );

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

// ===============================
// 🧩 Get single customer by ID
// ===============================
const getCustomerById = async (req, res) => {
  try {
    const customer = await Onboarding.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("❌ Error fetching customer by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};


const deleteCustomer = async (req, res) => {
  try {
    const customer = await Onboarding.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await customer.deleteOne();

    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).json({ success: false, message: "Failed to delete customer" });
  }
};

module.exports = {
  createOnboarding,
  getCompanyByEmail,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
};


