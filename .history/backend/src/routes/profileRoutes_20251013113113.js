const express = require("express");
const multer = require("multer");
const pathModule = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/profileController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = pathModule.join(__dirname, "../../uploads");
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = pathModule.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ✅ NEW ROUTE: get profile of logged-in user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    res.json({
      success: true,
      data: {
        _id: req.user._id,
        companyEmail: req.user.companyEmail || req.user.email,
        companyName: req.user.companyName,
        customerId: req.user._id,
        profileImage: req.user.profileImage || null,
      },
    });
  } catch (error) {
    console.error("Profile /me error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ GET profile by email (keep existing)
router.get("/me", auth, getProfile); // token-based

// ✅ PUT update profile
router.put("/:email", upload.single("avatar"), updateProfile);

module.exports = router;
