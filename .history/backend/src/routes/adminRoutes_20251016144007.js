// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminAvatar,
} = require("../controllers/adminController");

// -------------------- MULTER CONFIG --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/admin"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `admin-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// -------------------- ROUTES --------------------

// Get admin profile
router.get("/profile", protect, getAdminProfile);

// Update admin profile info
router.put("/profile", protect, updateAdminProfile);

// Upload admin avatar (the missing one!)
router.put(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  uploadAdminAvatar
);

module.exports = router;
