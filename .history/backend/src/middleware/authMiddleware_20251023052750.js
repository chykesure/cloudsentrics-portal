const jwt = require("jsonwebtoken");
const Staff = require("../models/staffModel");
const Onboarding = require("../models/Onboarding");

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

    // ✅ First check staff
    let user = await Staff.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.role = user.role?.toLowerCase() || "readonly";
      return next();
    }

    // ✅ If not staff, maybe customer (Onboarding)
    user = await Onboarding.findById(decoded.id);
    if (user) {
      req.user = user;
      req.role = "customer";
      return next();
    }

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

// ------------------ ROLE CHECKER MIDDLEWARE ------------------
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient privileges",
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
