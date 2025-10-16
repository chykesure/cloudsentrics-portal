// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Staff = require("../models/staffModel"); // for Admin & Super-Admin
const Onboarding = require("../models/Onboarding"); // for Customers

// ------------------ PROTECT ------------------
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1️⃣ Check Staff (includes admin & super-admin)
    let user = await Staff.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.role = user.role?.toLowerCase() || "admin";

      // tag super-admin separately for privilege control
      if (req.role === "super-admin") req.superAdmin = true;

      return next();
    }

    // 2️⃣ Check Onboarding (Customers)
    user = await Onboarding.findById(decoded.id);
    if (user) {
      req.user = user;
      req.role = "customer";
      return next();
    }

    // 3️⃣ If none found
    return res.status(401).json({
      success: false,
      message: "Invalid token or user not found",
    });
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ------------------ SUPER ADMIN ONLY ------------------
const superAdminOnly = (req, res, next) => {
  if (!req.user || req.role !== "super-admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Super-Admin only",
    });
  }
  next();
};

// ------------------ ADMIN OR SUPER ADMIN ------------------
const adminOnly = (req, res, next) => {
  if (!req.user || !["admin", "super-admin"].includes(req.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin only",
    });
  }
  next();
};

module.exports = { protect, adminOnly, superAdminOnly };
