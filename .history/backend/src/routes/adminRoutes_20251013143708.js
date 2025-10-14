const express = require("express");
const { adminLogin, createAdmin } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware"); // default import
const { getAdminDashboard } = require("../controllers/adminDashboard");
const router = express.Router();

// Admin login (public)
router.post("/login", adminLogin);

// Create admin - protected, only super-admin allowed
router.post(
  "/create",
  authMiddleware,
  async (req, res, next) => {
    if (req.admin?.role !== "super-admin") {
      return res.status(403).json({ message: "Forbidden - super-admin required" });
    }
    next();
  },
  createAdmin
);

router.get("/dashboard", verifyAdmin, getAdminDashboard);

module.exports = router;
