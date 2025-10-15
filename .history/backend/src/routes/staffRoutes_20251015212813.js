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
router.get("/", getAllStaff);
router.post("/", superAdminOnly, createStaff);
router.put("/:id", superAdminOnly, updateStaff);
router.delete("/:id", superAdminOnly, deleteStaff);
router.put("/:id/toggle", superAdminOnly, toggleStaffActive);

module.exports = router;
