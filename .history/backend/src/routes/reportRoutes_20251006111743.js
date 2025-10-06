const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), reportController.createReport);
router.get("/", reportController.getReports);
router.get("/:id", reportController.getReportById);
router.put("/:id", reportController.updateReport);
router.delete("/:id", reportController.deleteReport);

module.exports = router;
