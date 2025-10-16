const Staff = require("../models/staffModel"); // Use Staff instead of Admin
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

// -------------------- LOGIN ADMIN --------------------
exports.adminLogin = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  email = email.trim().toLowerCase();

  try {
    // Find admin or super-admin (active or not)
    const admin = await Staff.findOne({
      email,
      role: { $in: ["admin", "super-admin"] },
    }).select("+password");

    if (!admin)
      return res.status(400).json({ message: "Invalid email or password" });

    // If inactive
    if (!admin.active)
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact the Super-Admin.",
      });

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role.toLowerCase(),
        isAdmin: ["admin", "super-admin"].includes(admin.role.toLowerCase()),
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CREATE ADMIN --------------------
exports.createAdmin = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Prevent duplicate email
    const existing = await Staff.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin with this email already exists" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Staff({
      email,
      password: hashed,
      role: role ? role.toLowerCase() : "admin",
      active: true,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
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
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({ success: true, data: admin });
  } catch (err) {
    console.error("Get admin profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- UPLOAD ADMIN AVATAR --------------------

exports.uploadAdminAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const adminId = req.admin?.id || req.user?.id;
    const admin = await Staff.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Delete old avatar if exists
    if (admin.avatar) {
      const oldPath = path.join(__dirname, "../../", admin.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Save new avatar
    admin.avatar = `/uploads/admin/${req.file.filename}`;
    await admin.save();

    res.json({
  success: true,
  message: "Avatar uploaded successfully",
  data: {
    avatar: admin.avatar,
  },
});

  } catch (err) {
    console.error("Upload admin avatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
