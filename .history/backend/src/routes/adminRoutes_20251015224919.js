const express = require("express");
const router = express.Router();
const { superAdminOnly } = require("../middleware/authMiddleware");
const { adminLogin, createAdmin, getAdminProfile } = require("../controllers/adminController");
const { getAdminDashboard } = require("../controllers/adminDashboard");

// Public login
router.post("/login", adminLogin);

// Create admin (super-admin only)
router.post("/create", superAdminOnly, createAdmin);

// Dashboard
router.get("/dashboard", getAdminDashboard);

// Admin profile
router.get("/profile", getAdminProfile);

module.exports = router;
