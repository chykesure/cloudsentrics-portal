const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Controllers
const adminController = require("../controllers/adminController");
const staffController = require("../controllers/staffController");
const { createOnboarding, getCompanyByEmail, getAllCustomers, getCustomerById } = require("../controllers/onboardingController");
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

// 🔹 Login (Admin/Readonly)
router.post("/login", adminController.adminLogin);

// 🔹 Create new admin (Admin only)
router.post("/create", protect, authorize("admin"), adminController.createAdmin);

// 🔹 Get profile (Admin + Readonly)
router.get("/profile", protect, adminController.getAdminProfile);

// 🔹 Upload avatar
router.put(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  adminController.uploadAdminAvatar
);

// 🔹 Change password
router.post("/change-password", protect, adminController.changePassword);

// -------------------- STAFF MANAGEMENT --------------------
router.get("/staff", protect, authorize("admin"), staffController.getAllStaff);
router.post("/staff", protect, authorize("admin"), staffController.createStaff);
router.put("/staff/:id", protect, authorize("admin"), staffController.updateStaff);
router.put(
  "/staff/:id/toggle",
  protect,
  authorize("admin"),
  staffController.toggleStaffActive
);
router.delete("/staff/:id", protect, authorize("admin"), staffController.deleteStaff);

// -------------------- PASSWORD RECOVERY --------------------
router.post("/forgot-password", staffController.forgotPassword);
router.post("/reset-password/:token", staffController.resetPassword);
router.post("/change-password", staffController.changePassword);

// -------------------- CUSTOMER MANAGEMENT --------------------

// 🔹 Create onboarding record (if needed for admin use)
router.post("/customers/onboard", protect, authorize("admin"), createOnboarding);

// 🔹 Get all customers
router.get("/customers", protect, authorize("admin"), getAllCustomers);

// 🔹 Get single customer by ID
router.get("/customers/:id", protect, authorize("admin"), getCustomerById);

// 🔹 Lookup company by email
router.get("/customers/search", protect, authorize("admin"), getCompanyByEmail);

// -------------------- EXPORT ROUTER --------------------
module.exports = router;
