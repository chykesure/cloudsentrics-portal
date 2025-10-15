const express = require("express");
const router = express.Router();
const { protect, superAdminOnly } = require("../middleware/authMiddleware");
const {
  adminLogin,
  createAdmin,
  getAdminProfile,
} = require("../controllers/adminController");

// Public route
router.post("/login", adminLogin);

// Protected routes
router.post("/create", protect, superAdminOnly, createAdmin);
router.get("/profile", protect, getAdminProfile);

module.exports = router;
