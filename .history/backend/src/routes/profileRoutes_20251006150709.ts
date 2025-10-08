// src/routes/profileRoutes.js
const express = require("express");
const multer = require("multer");
const pathModule = require("path"); // renamed to avoid conflicts
const { getProfile, updateProfile } = require("../controllers/profileController");

const router = express.Router();

// Multer setup for avatar uploads
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

// GET profile
router.get("/:email", getProfile);

// POST update profile (with avatar upload)
router.post("/update/:email", upload.single("avatar"), updateProfile);

module.exports = router;
