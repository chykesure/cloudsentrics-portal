//src/routes/staff
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  loginStaff,
  changePassword,
  forgotPassword,
  resetPassword
} = require("../controllers/staffAuthController");

// Public
router.post("/login", loginStaff);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected
router.post("/change-password", protect, changePassword);

module.exports = router;
