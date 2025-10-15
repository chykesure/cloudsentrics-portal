const express = require("express");
const router = express.Router();
const { adminLogin, createAdmin, getAdminProfile } = require("../controllers/adminController");
const { getAdminDashboard } = require("../controllers/adminDashboard");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

// Public login
router.post("/login", adminLogin);

// Create new admin (super-admin only)
router.post("/create", protect, superAdminOnly, createAdmin);

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Profile
router.get("/profile", protect, getAdminProfile);

module.exports = router;
