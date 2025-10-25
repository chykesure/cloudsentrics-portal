// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const staffController = require("../controllers/staffController");
const {
  adminLogin,
  createAdmin,
  getAdminProfile,
  uploadAdminAvatar,
} = require("../controllers/adminController");
const { changePassword } = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware"); // use correct folder name

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

// 🔹 Login (any admin/readonly)
router.post("/login", adminLogin);

// 🔹 Create new admin/staff (Admin only)
router.post("/create", protect, authorize("admin"), createAdmin);

// 🔹 Get logged-in profile (Admin + Readonly)
router.get("/profile", protect, getAdminProfile);

// 🔹 Upload avatar (Admin + Readonly)
router.put(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  uploadAdminAvatar
);

// 🔹 Staff management routes (Admin only)

// Toggle active/inactive
router.put(
  "/staff/:id/toggle",
  protect,
  authorize("admin"),
  staffController.toggleStaffActive
);

// Update staff info
router.put(
  "/staff/:id",
  protect,
  authorize("admin"),
  staffController.updateStaff
);

// Delete staff
router.delete(
  "/staff/:id",
  protect,
  authorize("admin"),
  staffController.deleteStaff
);

// Get all staff
router.get(
  "/staff",
  protect,
  authorize("admin"),
  staffController.getAllStaff
);

// Create new staff
router.post(
  "/staff",
  protect,
  authorize("admin"),
  staffController.createStaff
);

// Forgot password
router.post("/forgot-password", staffController.forgotPassword);

// Reset password
router.post("/reset-password/:token", staffController.resetPassword);

router.post("/change-password", protect, changePassword);

module.exports = router;
