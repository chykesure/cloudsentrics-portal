
const express = require("express");
const router = express.Router();
const { protect, superAdminOnly } = require("../middleware/authMiddleware");
const { adminLogin, createAdmin, getAdminProfile } = require("../controllers/adminController");
const { getAdminDashboard } = require("../controllers/adminDashboard");

// Public login
router.post("/login", adminLogin);

// Create admin (super-admin only)
router.post("/create", protect, superAdminOnly, createAdmin);

// Dashboard (protected)
router.get("/dashboard", protect, getAdminDashboard);

// Admin profile (protected)
router.get("/profile", protect, getAdminProfile);

module.exports = router;
