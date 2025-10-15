const Staff = require("../models/staffModel");
const bcrypt = require("bcryptjs");

// -------------------- LOGIN STAFF/ADMIN --------------------
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const staff = await Staff.findOne({ email }).select("+password");
    if (!staff)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await staff.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = staff.generateAuthToken();
    staff.lastLogin = Date.now();
    await staff.save();

    res.json({
      token,
      staff: {
        id: staff._id,
        email: staff.email,
        role: staff.role.toLowerCase(),
        isAdmin: ["admin", "super-admin"].includes(staff.role.toLowerCase()),
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
    const existing = await Staff.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User with this email already exists" });

    const newStaff = new Staff({
      email,
      password,
      role: role ? role.toLowerCase() : "admin",
    });
    await newStaff.save();

    res.status(201).json({
      message: "Admin created successfully",
      staff: { id: newStaff._id, email: newStaff.email, role: newStaff.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- GET LOGGED-IN PROFILE --------------------
exports.getAdminProfile = async (req, res) => {
  try {
    const staff = await Staff.findById(req.admin?.id || req.user?.id).select("-password");
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.json({ success: true, data: staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
