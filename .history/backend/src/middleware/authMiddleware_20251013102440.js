// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const Onboarding = require("../models/Onboarding");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find the onboarding record using the ID inside the token
    const user = await Onboarding.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // ✅ Attach user to the request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
