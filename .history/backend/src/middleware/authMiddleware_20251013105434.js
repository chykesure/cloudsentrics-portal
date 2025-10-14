const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Onboarding = require("../models/Onboarding"); // ✅ add this

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Try to find user in both collections
    let user = await User.findById(decoded.id).select("-password");
    if (!user) {
      user = await Onboarding.findById(decoded.id);
    }

    // If not found in either
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
