// src/controllers/staffController.js
const Staff = require("../models/staffModel");  // ✅ Use actual Staff schema
const { sendEmail } = require("../services/emailService");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

// 🟢 GET all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json({ staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 CREATE new staff
exports.createStaff = async (req, res) => {
  try {
    const { email, role } = req.body;

    // ✅ Check if staff exists
    const exists = await Staff.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Staff already exists" });

    // ✅ Auto-generate password (8 hex chars)
    const tempPassword = crypto.randomBytes(4).toString("hex");

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // ✅ Create user with passwordChangeRequired flag
    const newStaff = await Staff.create({
      email,
      role,
      password: hashedPassword,
      passwordChangeRequired: true,
      active: true, // ✅ always active by default
    });


    const loginUrl = `${process.env.FRONTEND_URL || "https://onboardingportal.cloudsentrics.org"}/admin/login`;

    // ✅ Your original full HTML email template restored
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9fafb;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background-color: #032352;
          color: #fff;
          text-align: center;
          padding: 30px 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px 20px;
        }
        .content h2 {
          color: #032352;
          font-size: 20px;
          margin-top: 0;
        }
        .details {
          background: #f1f5f9;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .details li {
          margin-bottom: 8px;
        }
        a.button {
          display: inline-block;
          background-color: #032352;
          color: #fff !important;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 15px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #888;
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Cloudsentrics Portal 🎉</h1>
        </div>
        <div class="content">
          <h2>Hi ${email.split("@")[0]},</h2>
          <p>Your Portal account access has been created successfully. Here are your login details:</p>
          <ul class="details">
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
            <li><strong>Role:</strong> ${role}</li>
          </ul>
          <p>You can log in using the button below:</p>
          <a href="${loginUrl}" class="button">Login to Portal</a>
          <p style="margin-top: 20px;">Please change your password after first login for security.</p>
          <p>Best regards,<br/><strong>Cloudsentrics Admin Team</strong></p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Cloudsentrics. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    `;

    await sendEmail(email, "Welcome to Cloudsentrics Portal", html);

    res.status(201).json({
      message: "Staff created and email sent",
      staff: {
        _id: newStaff._id,
        email: newStaff.email,
        role: newStaff.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 UPDATE staff info
exports.updateStaff = async (req, res) => {
  try {
    const { email, role } = req.body;
    const updated = await Staff.findByIdAndUpdate(
      req.params.id,
      { email, role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff updated", staff: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 DELETE staff
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 TOGGLE active/inactive
exports.toggleStaffActive = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Prevent admin from toggling self
    if (staff.email === req.user.email) {
      return res.status(400).json({ message: "You cannot toggle your own account" });
    }

    staff.active = !staff.active;
    await staff.save();

    res.json({ message: `Staff ${staff.active ? "activated" : "deactivated"}`, staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// -------------------- FORGOT PASSWORD --------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const staff = await Staff.findOne({ email });
    if (!staff) return res.status(404).json({ message: "No account found with that email" });

    // Generate token and hash it for security
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save hashed token and expiry
    staff.resetPasswordToken = hashedToken;
    staff.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await staff.save();

    // Build frontend reset URL (token sent un-hashed)
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/admin/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 40px 0; color: #333;">
        <div style="max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background-color: #004aad; color: #ffffff; padding: 20px 40px; text-align: center;">
            <h1>CloudSentric Portal</h1>
          </div>
          <div style="padding: 30px 40px;">
            <p>Hello <strong>${staff.email}</strong>,</p>
            <p>We received a request to reset your password.</p>
            <p style="text-align:center; margin:30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #004aad; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px;">
                 Reset Password
              </a>
            </p>
            <p>If you didn’t request this, ignore this email. This link expires in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 13px; color: #999; text-align: center;">
              &copy; ${new Date().getFullYear()} CloudSentric. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    await sendEmail(staff.email, "Password Reset Request", html);

    res.json({ message: "Password reset email sent successfully" });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- RESET PASSWORD --------------------
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // plain token from frontend
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Hash the received token to match the one stored in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find staff with matching hashed token and valid expiry
    const staff = await Staff.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!staff) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    
    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    staff.password = hashedPassword;

    // Clear reset token and expiry fields
    staff.resetPasswordToken = undefined;
    staff.resetPasswordExpires = undefined;
    staff.passwordChangeRequired = false;

    await staff.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
