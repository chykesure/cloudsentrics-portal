// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding");
const Staff = require("../models/staffModel");

// 🔐 Protect middleware (for all authenticated users)
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Decoded Token:", decoded);

    // Try to match Admin, Staff, User, or Onboarding
    let account =
      (await Admin.findById(decoded.id).select("-password")) ||
      (await Staff.findById(decoded.id).select("-password")) ||
      (await User.findById(decoded.id).select("-password")) ||
      (await Onboarding.findById(decoded.id));

    if (!account) return res.status(401).json({ message: "Invalid token" });

    req.user = account; // store the user object
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// 🛡️ Restrict to Super-Admin only
const superAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "Super-Admin") {
    return res.status(403).json({ message: "Access denied: Super-Admin only" });
  }
  next();
};

module.exports = { protect, superAdminOnly };
