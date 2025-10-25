const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const Admin = require("../models/staffModel"); // or your admin model

// -------------------- LOGIN ADMIN --------------------
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// -------------------- CREATE ADMIN --------------------
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ name, email, password: hashed, role });

    res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ message: "Server error while creating admin" });
  }
};

// -------------------- GET ADMIN PROFILE --------------------
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- UPLOAD ADMIN AVATAR --------------------
exports.uploadAdminAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Delete old avatar if exists
    if (admin.avatar) {
      const oldPath = path.join(__dirname, "../../uploads/admin", admin.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    admin.avatar = req.file.filename;
    await admin.save();

    res.json({ message: "Avatar updated successfully", avatar: admin.avatar });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({ message: "Server error while uploading avatar" });
  }
};

// -------------------- CHANGE PASSWORD --------------------
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Both old and new passwords are required" });

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error while changing password" });
  }
};
