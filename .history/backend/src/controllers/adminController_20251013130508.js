const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/admin/login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role, email: admin.email }, process.env.JWT_SECRET || "secret", { expiresIn: "1d" });
    res.json({ token, admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/create (protected, super-admin only)
exports.createAdmin = async (req, res) => {
  const { email, password, role } = req.body;
  // role should normally be "admin" - only super-admin can create another super-admin (optional)
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  // role check: only super-admin can create admins (enforced in route)
  try {
    const exists = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: "Admin with that email already exists" });

    const admin = new Admin({
      email: email.toLowerCase().trim(),
      password,
      role: role === "super-admin" ? "super-admin" : "admin",
    });

    await admin.save();
    // don't return password
    res.status(201).json({ message: "Admin created", admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
