// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  adminLogin,
  createAdmin,
  getAdminProfile,
  uploadAdminAvatar,
} = require("../controllers/adminController");

const staffController = require("../controllers/staffController");

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

// Login anyone with credentials
router.post("/login", adminLogin);

// ✅ Only Admin (full rights) can create new accounts
router.post("/create", protect, authorize("admin"), createAdmin);

// ✅ Both Admin + Readonly can view own profile
router.get("/profile", protect, getAdminProfile);

// ✅ Both can upload avatar
router.put(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  uploadAdminAvatar
);

router.put(
  "/staff/:id/toggle",
  protecta, // make sure only logged-in admins can call
  staffController.toggleStaffActive
);
module.exports = router;
