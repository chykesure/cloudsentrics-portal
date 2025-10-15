// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Staff = require("../models/staffModel");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const staff = await Staff.findById(decoded.id).select("-password");
    if (!staff) return res.status(401).json({ message: "Invalid token" });

    req.user = staff;

    if (["admin", "super-admin"].includes(staff.role.toLowerCase())) {
      req.admin = staff;
    }

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.admin?.role.toLowerCase() !== "super-admin") {
    return res.status(403).json({ message: "Access denied: Super-Admin only" });
  }
  next();
};

module.exports = { protect, superAdminOnly };
