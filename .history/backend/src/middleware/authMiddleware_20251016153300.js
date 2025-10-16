// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Staff = require("../models/staffModel");
const Admin = require("../models/Admin");
const User = require("../models/userModel"); // 👈 Add this line

// Middleware to protect routes for Staff, Admin, or normal User
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ 1. Try Staff first (includes admins & super-admins)
    const staff = await Staff.findById(decoded.id).select("-password");
    if (staff) {
      req.user = staff;
      if (["admin", "super-admin"].includes(staff.role.toLowerCase())) {
        req.admin = staff;
      }
      return next();
    }

    // ✅ 2. Try Admin model (if you keep separate admin collection)
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      return next();
    }

    // ✅ 3. Try Normal User (for customers)
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      return next();
    }

    // ❌ If no one found
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
