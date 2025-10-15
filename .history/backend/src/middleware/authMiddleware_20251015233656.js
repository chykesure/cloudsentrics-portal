// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Staff = require("../models/staffModel");
const Admin = require("../models/Admin");

// Middleware to protect routes for Staff or Admin
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try Staff first
    const staff = await Staff.findById(decoded.id).select("-password");
    if (staff) {
      req.user = staff;
      if (["admin", "super-admin"].includes(staff.role.toLowerCase())) {
        req.admin = staff;
      }
      return next();
    }

    // Try Admin next
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      return next();
    }

    // Neither Staff nor Admin found
    return res.status(401).json({ message: "Invalid token" });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware for super-admin only routes
const superAdminOnly = (req, res, next) => {
  if (req.admin?.role.toLowerCase() !== "super-admin") {
    return res.status(403).json({ message: "Access denied: Super-Admin only" });
  }
  next();
};

module.exports = { protect, superAdminOnly };
