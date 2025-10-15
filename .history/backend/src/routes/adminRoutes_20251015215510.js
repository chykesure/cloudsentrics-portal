const express = require("express");
const router = express.Router();
const { protect, superAdminOnly } = require("../middleware/authMiddleware");
const { adminLogin, createAdmin, getAdminProfile } = require("../controllers/adminController");
const { getAdminDashboard } = require("../controllers/adminDashboard");

// Public login
router.post("/login", adminLogin);

// Create admin (super-admin only)
router.post("/create", protect, superAdminOnly, createAdmin);

// Dashboard
router.get("/dashboard", protect, getAdminDashboard);

// Admin profile
router.get("/profile", protect, getAdminProfile);

module.exports = router;
