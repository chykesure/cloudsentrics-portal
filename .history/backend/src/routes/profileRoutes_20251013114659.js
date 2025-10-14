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
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Send profile data in a shape your frontend expects
    res.json({
      success: true,
      data: {
        _id: req.user._id,
        name: req.user.name,
        companyEmail: req.user.companyEmail || req.user.email,
        phone: req.user.phone || "",
        companyName: req.user.companyName || "",
        tier: req.user.tier || "STANDARD TIER",
        storage: req.user.storage || "200GB",
        avatar: req.user.avatar
          ? req.user.avatar.startsWith("http")
            ? req.user.avatar
            : `/uploads/${path.basename(req.user.avatar)}`
          : null,
      },
    });
  } catch (error) {
    console.error("Profile /me error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------- UPDATE PROFILE --------------------
router.put("/:email", authMiddleware, upload.single("avatar"), updateProfile);

module.exports = router;
