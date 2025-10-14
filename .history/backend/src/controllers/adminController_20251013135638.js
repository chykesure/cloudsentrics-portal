// src/controllers/adminController.js
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/admin/login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const admin = await Admins.findOne({ email });
    if (!admin)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // create JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/create (for super-admin to create admins)
exports.createAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin with this email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ email, password: hashed, role: "admin" });
    await admin.save();

    res.status(201).json({ message: "Admin created successfully", admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
