const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createReport,
  getReports,
  updateReport,
  deleteReport,
  getReportById,
} = require("../controllers/reportController");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Routes
router.post("/reports", upload.single("image"), createReport);
router.get("/reports", getReports);
router.get("/reports/:id", getReportById);
router.put("/reports/:id", updateReport);
router.delete("/reports/:id", deleteReport);

module.exports = router;
