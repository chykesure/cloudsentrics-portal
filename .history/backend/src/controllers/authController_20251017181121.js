const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding"); // ✅ Import added

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
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashedPassword, name });

    res.status(201).json({
      token: generateToken(user),
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password, customerId } = req.body;

  if (!email || !customerId) {
    return res.status(400).json({ success: false, message: "Email and Customer ID are required" });
  }

  try {
    let user = await User.findOne({ email, customerId });
    let fromOnboarding = false;

    // If not found in Users, check Onboarding
    if (!user) {
      user = await Onboarding.findOne({
        "companyInfo.companyEmail": email,
        customerId: customerId
      });
      fromOnboarding = !!user;
    }

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Only validate password for User model
    if (!fromOnboarding) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }
    }

    // Generate JWT token
    const token = generateToken(user);

    // Prepare user data for response
    const userData = {
      id: user._id,
      email: user.email || user.companyInfo?.companyEmail,
      name: user.name || user.companyInfo?.primaryName || "User",
      customerId: user.customerId,
      type: fromOnboarding ? "onboarding" : "user"
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}



// GET /api/auth/validate-account/:accountId
exports.validateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const record = await Onboarding.findOne({ customerId: accountId });

    if (!record) {
      return res.status(404).json({ valid: false, message: "Account not found" });
    }

    res.json({
      valid: true,
      companyName: record.companyInfo.companyName,
      companyEmail: record.companyInfo.companyEmail,
    });
  } catch (err) {
    console.error("Account validation error:", err);
    res.status(500).json({ valid: false, message: "Server error" });
  }
};

