// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const {
  adminLogin,
  createAdmin,
  getAdminProfile,
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

// Admin login
router.post("/login", adminLogin);

// Create admin
router.post("/create", protect, createAdmin);

// Get admin profile
router.get("/profile", protect, getAdminProfile);

// Upload admin avatar (new route)
router.put(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  uploadAdminAvatar
);

module.exports = router;
