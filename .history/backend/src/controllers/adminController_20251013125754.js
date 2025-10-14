const Admin = require("../models/Admin"); // your Mongoose Admin model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.json({ token, admin: { id: admin._id, email: admin.email, role: admin.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
