// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect, superAdminOnly } = require("../middleware/authMiddleware");
const { 
  adminLogin, 
  createAdmin, 
  getAdminProfile 
} = require("../controllers/adminController");
const { getAdminDashboard } = require("../controllers/adminDashboard");
const upload = require("../middleware/uploadMiddleware");
const Admin = require("../models/Admin"); // for direct avatar update

// ---------------- PUBLIC ROUTES ----------------
router.post("/login", adminLogin);

// ---------------- SUPER ADMIN ROUTES ----------------
router.post("/create", protect, superAdminOnly, createAdmin);

// ---------------- PROTECTED ROUTES ----------------
router.get("/dashboard", protect, getAdminDashboard);
router.get("/profile", protect, getAdminProfile);

// ---------------- AVATAR UPLOAD ----------------
// PUT /api/admin/profile/avatar
router.put("/profile/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Save uploaded image path
    admin.avatar = `/uploads/${req.file.filename}`;
    await admin.save();

    res.json({
      message: "Avatar updated successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
