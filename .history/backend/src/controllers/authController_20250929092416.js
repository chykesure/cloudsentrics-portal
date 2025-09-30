// src/controllers/authController.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ email, password, name });
    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, customerId } = req.body;

    // Find user by company email
    const user = await Onboarding.findOne({ "companyInfo.companyEmail": email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Match customerId
    if (user.customerId !== customerId) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.companyInfo.companyEmail,
        companyName: user.companyInfo.companyName,
        customerId: user.customerId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW: Validate Account ID
// GET /api/auth/validate-account/:accountId
exports.validateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    // Check if an onboarding record exists with this customerId
    const account = await Onboarding.findOne({ "agreements.customerId": accountId });

    if (!account) {
      return res.json({ valid: false });
    }

    return res.json({ valid: true });
  } catch (err) {
    console.error("Account validation error:", err);
    res.status(500).json({ valid: false });
  }
};
