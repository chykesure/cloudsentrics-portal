const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const multer = require("multer");
const path = require("path");

// Multer setup for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/profile/:email", profileController.getProfile);
router.post("/profile/update/:email", upload.single("avatar"), profileController.updateProfile);

module.exports = router;
