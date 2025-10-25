const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

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

// -------------------- ROUTES --------------------
// -------------------- ADMIN AUTH & PROFILE --------------------
router.post("/login", adminController.adminLogin);
router.post("/create", protect, authorize("admin"), adminController.createAdmin);
router.get("/profile", protect, adminController.getAdminProfile);
router.put("/profile/avatar", protect, upload.single("avatar"), adminController.uploadAdminAvatar);
router.post("/change-password", protect, adminController.changePassword);

// -------------------- STAFF MANAGEMENT --------------------
router.get("/staff", protect, authorize("admin"), staffController.getAllStaff);
router.post("/staff", protect, authorize("admin"), staffController.createStaff);
router.put("/staff/:id", protect, authorize("admin"), staffController.updateStaff);
router.put("/staff/:id/toggle", protect, authorize("admin"), staffController.toggleStaffActive);
router.delete("/staff/:id", protect, authorize("admin"), staffController.deleteStaff);

// -------------------- PASSWORD RECOVERY --------------------
router.post("/forgot-password", staffController.forgotPassword);
router.post("/reset-password/:token", staffController.resetPassword);


module.exports = router;
