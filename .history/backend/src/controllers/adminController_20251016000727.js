const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// -------------------- LOGIN ADMIN --------------------
// -------------------- LOGIN ADMIN --------------------
exports.adminLogin = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  // Normalize email
  email = email.trim().toLowerCase();

  try {
    // Use case-insensitive query
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// -------------------- CREATE ADMIN --------------------
exports.createAdmin = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const existing = await Admin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Admin with this email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      email,
      password: hashed,
      role: role ? role.toLowerCase() : "admin",
    });
    await newAdmin.save();

    res.status(201).json({
      message: "Admin created successfully",
      admin: { id: newAdmin._id, email: newAdmin.email, role: newAdmin.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- GET LOGGED-IN PROFILE --------------------
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin?.id || req.user?.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json({ success: true, data: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
