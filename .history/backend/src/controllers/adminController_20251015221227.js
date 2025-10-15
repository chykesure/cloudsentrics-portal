const Staff = require("../models/staffModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// -------------------- ADMIN LOGIN --------------------
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    // Include password in query for bcrypt comparison
    const admin = await Staff.findOne({ email }).select("+password");
    if (!admin) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = admin.generateAuthToken();

    // update last login
    admin.lastLogin = Date.now();
    await admin.save();

    res.json({
      token,
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CREATE ADMIN --------------------
// Only super-admin can create new admins
exports.createAdmin = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const existing = await Staff.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin with this email already exists" });

    // Default role to "Admin" if not provided
    const newRole = role && ["Admin", "Super-Admin"].includes(role) ? role : "Admin";

    const admin = new Staff({ email, password, role: newRole });
    await admin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: { id: admin._id, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- GET ADMIN PROFILE --------------------
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Staff.findById(req.admin?.id || req.user?.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({ success: true, data: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
