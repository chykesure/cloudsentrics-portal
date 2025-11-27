// backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


// JWT token generator
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.companyEmail || user.email, // <-- include company email
      role: user.role || "User",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};


// Utility to generate random temporary password
const generateRandomPassword = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -------------------- SIGNUP --------------------
exports.signup = async (req, res) => {
  try {
    const { email, name } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const tempPassword = generateRandomPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      email,
      password: hashedTempPassword,
      name,
      mustChangePassword: true,
      temporaryPassword: hashedTempPassword,
    });

    // Send temp password email
    const mailOptions = {
      from: `"CloudSentric Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Temporary Password",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color:#f7f9fc; padding:40px 0;">
          <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.08); overflow:hidden;">
            <div style="background:linear-gradient(90deg, #0047ab, #007bff); color:#ffffff; text-align:center; padding:30px 20px;">
              <h2 style="margin:0; font-weight:600; font-size:22px;">Welcome to CloudSentric</h2>
            </div>
            <div style="padding:30px; color:#333;">
              <p style="font-size:16px;">Dear <strong>${name || "Customer"}</strong>,</p>
              <p style="font-size:15px; line-height:1.6;">
                Your temporary password is:
                <strong style="color:#0047ab; font-size:18px;">${tempPassword}</strong>
              </p>
              <p style="font-size:15px; line-height:1.6;">
                Please use this password to log in for the first time. You will be prompted to change it immediately.
              </p>
              <p style="font-size:15px; margin-top:25px;">
                Warm regards,<br/>
                <strong>CloudSentric Support Team</strong><br/>
                <a href="mailto:info@cloudsentrics.org" style="color:#007bff; text-decoration:none;">info@cloudsentrics.org</a>
              </p>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User created with temporary password. Please check your email.",
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- LOGIN --------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Lookup onboarding by company email (case-insensitive)
    const onboarding = await Onboarding.findOne({
      "companyInfo.companyEmail": email.toLowerCase().trim(),
    });

    if (!onboarding) {
      return res.status(400).json({ message: "Email not found" });
    }

    let isMatch = false;

    // ✅ Try bcrypt compare first (only if passwordHash exists)
    if (onboarding.user?.passwordHash || onboarding.passwordHash) {
      const hash = onboarding.user?.passwordHash || onboarding.passwordHash;
      isMatch = await bcrypt.compare(password, hash);
    }

    // ✅ TEMP BYPASS: allow login using temporary password for first-time users
    if (
      !isMatch &&
      (onboarding.user?.mustChangePassword || onboarding.mustChangePassword) &&
      onboarding.tempPassword
    ) {
      if (password === onboarding.tempPassword) {
        isMatch = true;
        console.log("Temporary password bypass used for first login.");
      }
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Password mismatch" });
    }

    // Generate JWT token
    const token = generateToken({
      _id: onboarding._id,
      email: onboarding.companyInfo.companyEmail,
      role: onboarding.user?.role || onboarding.role,
      companyEmail: onboarding.companyInfo.companyEmail
    });


    // First-time login: force password change
    if (onboarding.user?.mustChangePassword || onboarding.mustChangePassword) {
      return res.status(200).json({
        success: true,
        message: "Temporary password login. You must change your password.",
        mustChangePassword: true,
        token,
        user: {
          id: onboarding._id,
          email: onboarding.companyInfo.companyEmail,
          name: onboarding.companyInfo.primaryName,
          customerId: onboarding.customerId,
          role: onboarding.user?.role || onboarding.role,
        },
      });
    }

    // Normal login
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: onboarding._id,
        email: onboarding.companyInfo.companyEmail,
        name: onboarding.companyInfo.primaryName,
        customerId: onboarding.customerId,
        role: onboarding.user?.role || onboarding.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// -------------------- CHANGE PASSWORD --------------------
// src/controllers/authController.js
exports.changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const onboarding = await Onboarding.findById(userId);

    if (!onboarding) {
      return res.status(404).json({ message: "User not found" });
    }

    let currentHash = onboarding.user?.passwordHash || onboarding.passwordHash;
    let tempPassword = onboarding.tempPassword;

    // Check old password or temp password for first login
    const isMatch = await bcrypt.compare(oldPassword, currentHash) ||
      (!onboarding.user && oldPassword === tempPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // Save new password and mark mustChangePassword false
    if (onboarding.user) {
      onboarding.user.passwordHash = newHash;
      onboarding.user.mustChangePassword = false;
    } else {
      onboarding.passwordHash = newHash;
      onboarding.mustChangePassword = false;
    }

    // Clear temp password
    onboarding.tempPassword = "";

    await onboarding.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Look for the user
    let userRecord = await Onboarding.findOne({ "companyInfo.companyEmail": email.toLowerCase().trim() });
    if (!userRecord) {
      userRecord = await User.findOne({ email: email.toLowerCase().trim() });
      if (!userRecord) return res.status(404).json({ message: "User not found" });
    }

    // Construct reset URL using userId (_id)
    const resetUrl = `http://localhost:5173/reset-password/${userRecord._id}`;

    // Send email
    const mailOptions = {
      from: `"CloudSentric Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color:#f7f9fc; padding:40px 0;">
          <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.08); overflow:hidden;">
            <div style="background:linear-gradient(90deg, #0047ab, #007bff); color:#ffffff; text-align:center; padding:30px 20px;">
              <h2 style="margin:0; font-weight:600; font-size:22px;">Reset Your Password</h2>
            </div>
            <div style="padding:30px; color:#333;">
              <p>Dear <strong>${userRecord.companyInfo?.companyName || userRecord.name || "Customer"}</strong>,</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background:#0047ab; color:white; border-radius:5px; text-decoration:none; margin-top:10px;">Reset Password</a>
              <p style="margin-top:25px;">If you did not request this, please ignore this email.</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// -------------------- RESET PASSWORD --------------------
// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: "User ID and new password are required" });
    }

    // Find user in Onboarding or User collection
    const userRecord = await Onboarding.findById(userId) || await User.findById(userId);
    if (!userRecord) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and mark mustChangePassword false
    if (userRecord.user) {
      userRecord.user.passwordHash = hashedPassword;
      userRecord.user.mustChangePassword = false;
    } else {
      userRecord.passwordHash = hashedPassword;
      userRecord.mustChangePassword = false;
    }

    await userRecord.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




// GET /api/auth/validate-account/:accountId
exports.validateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const record = await Onboarding.findOne({ customerId: accountId });

    if (!record) {
      return res.status(404).json({
        valid: false,
        message: "Account not found",
      });
    }

    res.json({
      valid: true,
      companyName: record.companyInfo.companyName,
      companyEmail: record.companyInfo.companyEmail,
    });
  } catch (err) {
    console.error("Account validation error:", err);
    res.status(500).json({
      valid: false,
      message: "Server error",
    });
  }
};


// -------------------- CUSTOMER ID RECOVERY --------------------
exports.recoverCustomerId = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Onboarding.findOne({ "companyInfo.companyEmail": email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const mailOptions = {
      from: `"CloudSentric Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Customer ID Recovery",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color:#f7f9fc; padding:40px 0;">
          <div style="max-width:600px; margin:0 auto; background-color:#ffffff; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.08); overflow:hidden;">
            <div style="background:linear-gradient(90deg, #0047ab, #007bff); color:#ffffff; text-align:center; padding:30px 20px;">
              <h2 style="margin:0; font-weight:600; font-size:22px;">Customer ID Recovery</h2>
            </div>
            <div style="padding:30px; color:#333;">
              <p style="font-size:16px;">Dear <strong>${user.companyInfo?.primaryName || "Customer"}</strong>,</p>
              <p style="font-size:15px; line-height:1.6;">
                Your CloudSentric Customer ID is:
                <strong style="font-size:18px; font-weight:700; color:#0047ab;">${user.customerId}</strong>
              </p>
              <p style="font-size:15px; line-height:1.6;">
                If you did not request this, please ignore this email or contact support.
              </p>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.json({ message: "Customer ID sent to your email" });
  } catch (err) {
    console.error("Customer ID recovery error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
