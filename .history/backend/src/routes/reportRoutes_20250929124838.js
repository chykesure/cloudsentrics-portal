const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} = require("../controllers/reportController");

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post("/", upload.single("image"), createReport);
router.get("/", getReports);
router.get("/:id", getReportById);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport);

module.exports = router;
