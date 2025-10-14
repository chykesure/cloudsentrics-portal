const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const { updateProfile } = require("../controllers/profileController");

const router = express.Router();

// -------------------- MULTER STORAGE SETUP --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, "../../uploads");
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// -------------------- GET LOGGED-IN USER PROFILE --------------------
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Handle both Onboarding and User models gracefully
    const isOnboardingUser = !!user.companyInfo;

    const profileData = {
      _id: user._id,
      name: isOnboardingUser
        ? user.companyInfo.primaryName
        : user.name || "User",
      companyEmail: isOnboardingUser
        ? user.companyInfo.companyEmail
        : user.companyEmail || user.email,
      phone: isOnboardingUser
        ? user.companyInfo.primaryPhone
        : user.phone || "",
      companyName: isOnboardingUser
        ? user.companyInfo.companyName
        : user.companyName || "",
      tier: user.tier || "STANDARD TIER",
      storage: user.storage || "200GB",
      avatar: user.avatar
        ? user.avatar.startsWith("http")
          ? user.avatar
          : `/uploads/${path.basename(user.avatar)}`
        : null,
    };

    return res.json({ success: true, data: profileData });
  } catch (error) {
    console.error("Profile /me error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------- UPDATE PROFILE --------------------
router.put("/:email", authMiddleware, upload.single("avatar"), updateProfile);

module.exports = router;
