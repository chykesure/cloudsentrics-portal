const express = require("express");
const multer = require("multer");
const path = require("path");
const protect = require("../middleware/authMiddleware");
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
router.get("/me", protect, getProfile);

// -------------------- UPDATE PROFILE --------------------
router.put("/:email", protect, upload.single("avatar"), updateProfile);

module.exports = router;
