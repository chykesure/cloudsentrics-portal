// routes/reportRoutes.js

const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/auth");
const {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} = require("../controllers/reportController");

const router = express.Router();

// Multer setup for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// -------------------- ROUTES --------------------

// Create a report (with optional file upload)
router.post("/", upload.single("image"), createReport);

// Get all reports
router.get("/", getReports);

// Get report by ID
router.get("/:id", getReportById);

// Update report by ID
router.put("/:id", updateReport);

// Delete report by ID
router.delete("/:id", deleteReport);

module.exports = router;
