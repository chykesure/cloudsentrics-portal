const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Controllers
const staffController = require("../controllers/staffController");
const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

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

// -------------------- ADMIN AUTH & PROFILE --------------------

// 🔹 Login (any admin/readonly)
router.post("/login", adminController.adminLogin);

// 🔹 Create new admin/staff (Admin only)
router.post("/create", protect, authorize("admin"), adminController.createAdmin);

// 🔹 Get logged-in profile (Admin + Readonly)
router.get("/profile", protect, adminController.getAdminProfile);

// 🔹 Upload avatar
router.put(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  adminController.uploadAdminAvatar
);

// 🔹 Change password (Admin + Readonly)
router.post("/change-password", protect, adminController.changePassword);

// -------------------- STAFF MANAGEMENT --------------------

// 🔹 Get all staff
router.get("/staff", protect, authorize("admin"), staffController.getAllStaff);

// 🔹 Create staff
router.post("/staff", protect, authorize("admin"), staffController.createStaff);

// 🔹 Update staff
router.put("/staff/:id", protect, authorize("admin"), staffController.updateStaff);

// 🔹 Toggle staff active/inactive
router.put(
  "/staff/:id/toggle",
  protect,
  authorize("admin"),
  staffController.toggleStaffActive
);

// 🔹 Delete staff
router.delete("/staff/:id", protect, authorize("admin"), staffController.deleteStaff);

// -------------------- PASSWORD RECOVERY --------------------

// 🔹 Forgot password
router.post("/forgot-password", staffController.forgotPassword);

// 🔹 Reset password
router.post("/reset-password/:token", staffController.resetPassword);

// -------------------- EXPORT ROUTER --------------------
module.exports = router;
