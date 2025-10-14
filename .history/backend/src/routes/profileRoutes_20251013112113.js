const express = require("express");
const multer = require("multer");
const pathModule = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const { getProfile, updateProfile } = require("../controllers/profileController");

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

// ✅ GET profile by email (existing)
router.get("/:email", getProfile);

// ✅ PUT update profile (existing)
router.put("/:email", upload.single("avatar"), updateProfile);

// ✅ NEW: Fetch profile of logged-in user using token
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      data: {
        companyEmail: user.companyInfo?.companyEmail || user.email,
        companyName: user.companyInfo?.companyName || user.name,
        customerId: user.customerId || user._id,
        profileImage: user.profileImage || null,
      },
    });
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
