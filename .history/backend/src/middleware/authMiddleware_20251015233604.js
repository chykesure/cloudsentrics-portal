const Staff = require("../models/staffModel");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try Staff first
    let user = await Staff.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      if (["admin", "super-admin"].includes(user.role.toLowerCase())) req.admin = user;
      return next();
    }

    // Try Admin next
    const admin = await Admin.findById(decoded.id).select("-password");
    if (admin) {
      req.admin = admin;
      return next();
    }

    return res.status(401).json({ message: "Invalid token" });
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
