const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Controllers
const adminController = require("../controllers/adminController");
const staffController = require("../controllers/staffController");

// Middleware
const { protect, authorize } = require("../middleware/authMiddleware");

// ------------------------------------------------------------
// 🔹 MULTER CONFIGURATION (For admin avatar uploads)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 🔹 ADMIN AUTH & PROFILE ROUTES
// ------------------------------------------------------------

// Admin Login (Public)
router.post("/login", adminController.adminLogin);

// Create new admin account (Only Admins)
router.post("/create", protect, authorize("admin"), adminController.createAdmin);

// Get logged-in admin profile (Admin + Readonly)
router.get("/profile", protect, adminController.getAdminProfile);

// Upload or update admin avatar
router.put(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  adminController.uploadAdminAvatar
);

// Change password (Admin or Staff)
router.post("/change-password", protect, adminController.changePassword);

// ------------------------------------------------------------
// 🔹 STAFF MANAGEMENT ROUTES (Protected: Admin only)
// ------------------------------------------------------------

// Get all staff
router.get("/staff", protect, authorize("admin"), staffController.getAllStaff);

// Create new staff
router.post("/staff", protect, authorize("admin"), staffController.createStaff);

// Update staff details
router.put("/staff/:id", protect, authorize("admin"), staffController.updateStaff);

// Toggle staff active/inactive
router.put(
  "/staff/:id/toggle",
  protect,
  authorize("admin"),
  staffController.toggleStaffActive
);

// Delete staff
router.delete(
  "/staff/:id",
  protect,
  authorize("admin"),
  staffController.deleteStaff
);

// ------------------------------------------------------------
// 🔹 PASSWORD RECOVERY ROUTES (Public)
// ------------------------------------------------------------
router.post("/forgot-password", staffController.forgotPassword);
router.post("/reset-password/:token", staffController.resetPassword);

// ------------------------------------------------------------
// 🔹 EXPORT ROUTER
// ------------------------------------------------------------
module.exports = router;
