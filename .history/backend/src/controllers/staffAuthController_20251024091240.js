// src/controllers/staffAuthController.js
const Staff = require("../models/staffModel");
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService"); // ✅ reuse your existing email service

// -------------------- LOGIN STAFF --------------------
// -------------------- LOGIN STAFF --------------------
exports.loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email }).select("+password");

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    // ✅ NEW: Check if staff is active
    if (!staff.active) {
      return res.status(403).json({ success: false, message: "Account inactive. Contact admin." });
    }

    const isMatch = await staff.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = staff.generateAuthToken();
    staff.lastLogin = Date.now();
    await staff.save();

    res.json({
      success: true,
      message: "Login successful",
      token,
      staff: {
        id: staff._id,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// -------------------- CHANGE PASSWORD --------------------
exports.changePassword = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const staff = await Staff.findById(staffId).select("+password");
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    const isMatch = await staff.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect old password" });
    }

    staff.password = newPassword;
    await staff.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- FORGOT PASSWORD --------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }

    // generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    staff.resetPasswordToken = resetPasswordToken;
    staff.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await staff.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: staff.email,
      subject: "Password Reset Request",
      html: `
        <h3>Password Reset</h3>
        <p>Click below to reset your password:</p>
        <a href="${resetURL}" target="_blank">${resetURL}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    res.json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
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
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!staff) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password and save it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    staff.password = hashedPassword;

    // Clear reset token and expiry fields
    staff.resetPasswordToken = undefined;
    staff.resetPasswordExpire = undefined;
    staff.passwordChangeRequired = false;

    await staff.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
