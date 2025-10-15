const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding");

// ----------------------------------------------
// PROTECT middleware
// ----------------------------------------------
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔍 Decoded Token:", decoded);

    // Try Admin first
    let admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      req.user = admin;
      return next();
    }

    // Then User / Onboarding
    let user = await User.findById(decoded.id).select("-password");
    if (!user) user = await Onboarding.findById(decoded.id);

    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ----------------------------------------------
// SUPER ADMIN ONLY middleware
// ----------------------------------------------
const superAdminOnly = (req, res, next) => {
  const role = req.admin?.role || req.user?.role;
  if (role !== "super-admin" && role !== "Super-Admin") {
    return res.status(403).json({ message: "Access denied: Super-Admin only" });
  }
  next();
};

// ----------------------------------------------
// EXPORT BOTH
// ----------------------------------------------
module.exports = { protect, superAdminOnly };
