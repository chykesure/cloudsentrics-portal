const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ email, password, name });
    res.status(201).json({ token: generateToken(user), user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, customerId } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Compare customerId (assuming it's stored like a password)
    const isMatch = await bcrypt.compare(customerId, user.customerId);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Return token
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
