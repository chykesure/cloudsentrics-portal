const Staff = require("../models/staffModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
// -------------------- LOGIN ADMIN --------------------
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Include password for comparison
    const admin = await Staff.findOne({ email: email.toLowerCase() }).select("+password");

    if (!admin) {
      console.log("Login failed: no admin found with email", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!admin.active) {
      console.log("Login failed: account inactive for", email);
      return res.status(400).json({ message: "Account is inactive" });
    }

    // Debug: show what is being compared
    console.log("Frontend password:", password);
    console.log("Stored hash:", admin.password);

    const isMatch = await bcrypt.compare(password, admin.password);

    console.log("Password match:", isMatch);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Include passwordChangeRequired for frontend logic
    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role.toLowerCase(),
        isAdmin: admin.role.toLowerCase() === "admin",
        passwordChangeRequired: admin.passwordChangeRequired || false,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CREATE ADMIN --------------------
exports.createAdmin = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const existing = await Staff.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Account already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Staff({
      email,
      password: hashed,
      role: role ? role.toLowerCase() : "readonly",
      active: true,
    });

    await newAdmin.save();
    res.status(201).json({
      message: "Account created successfully",
      admin: { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role },
    });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- GET LOGGED-IN PROFILE --------------------
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Staff.findById(req.admin?.id || req.user?.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Account not found" });
    res.json({ success: true, data: admin });
  } catch (err) {
    console.error("Get admin profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- UPLOAD ADMIN AVATAR --------------------
exports.uploadAdminAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const adminId = req.admin?.id || req.user?.id;
    const admin = await Staff.findById(adminId);
    if (!admin)
      return res.status(404).json({ message: "Account not found" });

    // remove old avatar if it exists
    if (admin.avatar) {
      const oldPath = path.join(__dirname, "../../", admin.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    admin.avatar = `/uploads/admin/${req.file.filename}`;
    await admin.save();

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data: { avatar: admin.avatar },
    });
  } catch (err) {
    console.error("Upload admin avatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// -------------------- CHANGE PASSWORD --------------------
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both old and new passwords are required" });

    // Fetch admin from DB including password
    const admin = await Staff.findById(req.user.id).select("+password");
    if (!admin)
      return res.status(404).json({ message: "Account not found" });

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect old password" });

    // Hash new password and save
    admin.password = await bcrypt.hash(newPassword, 10);
    admin.passwordChangeRequired = false; // mark as changed
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

