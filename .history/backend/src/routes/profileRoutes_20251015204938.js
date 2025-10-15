const express = require("express");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

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
// ✅ FIXED: Calls controller logic to fetch latest tier and profile info
router.get("/me", authMiddleware, getProfile);

// -------------------- UPDATE PROFILE --------------------
// Handles avatar upload and saves info to DB
router.put("/:email", authMiddleware, upload.single("avatar"), updateProfile);

module.exports = router;
