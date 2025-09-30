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
exports.login = async (req, res) => {
  try {
    const { email, customerId } = req.body;

    // 1. Find onboarding record by company email
    const onboardingRecord = await Onboarding.findOne({
      "companyInfo.companyEmail": email,
    });

    if (!onboardingRecord) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Match customerId
    if (onboardingRecord.customerId !== customerId) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate token
    const token = generateToken(onboardingRecord);

    // 4. Send token + user info
    res.json({
      token,
      user: {
        id: onboardingRecord._id,
        companyEmail: onboardingRecord.companyInfo.companyEmail,
        companyName: onboardingRecord.companyInfo.companyName,
        customerId: onboardingRecord.customerId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET /api/validate-account/:accountId
exports.validateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const record = await Onboarding.findOne({ "agreements.customerId": accountId });

    if (!record) {
      return res.status(404).json({ valid: false, message: "Account not found" });
    }

    res.json({
      valid: true,
      companyName: record.companyInfo.companyName,
      companyEmail: record.companyInfo.companyEmail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: "Server error" });
  }
};

