// src/routes/staffAuthRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Import controller functions correctly
const {
  loginStaff,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/staffAuthController");

// -------------------- STAFF AUTH ROUTES --------------------

// Public routes
router.post("/login", loginStaff);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected route (requires token)
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
