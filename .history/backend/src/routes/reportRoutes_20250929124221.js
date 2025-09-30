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

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /api/reports (with file upload)
router.post("/", upload.single("image"), createReport);

// GET /api/reports
router.get("/", getReports);

// GET single report by ID
router.get("/:id", getReportById);

// PUT /api/reports/:id
router.put("/:id", updateReport);

// DELETE /api/reports/:id
router.delete("/:id", deleteReport);

module.exports = router;
