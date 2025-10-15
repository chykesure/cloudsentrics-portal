// src/routes/staffAuthRoutes.js
const express = require("express");
const { loginStaff, changePassword, forgotPassword, resetPassword } = require("../controllers/staffAuthController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Authentication routes
router.post("/login", loginStaff);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected route (must be logged in)
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
