// src/routes/staffRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffActive,
} = require("../controllers/staffController");
const { protect, superAdminOnly } = require("../middleware/authMiddleware");

// All routes below require authentication
router.get("/", protect, getAllStaff);
router.post("/", protect, superAdminOnly, createStaff);
router.put("/:id", protect, superAdminOnly, updateStaff);
router.delete("/:id", protect, superAdminOnly, deleteStaff);
router.put("/:id/toggle", protect, superAdminOnly, toggleStaffActive);

module.exports = router;
