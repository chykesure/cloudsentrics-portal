// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Make sure you have a User model

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
};

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Staff.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};