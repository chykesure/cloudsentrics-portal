const express = require("express");
const { createReport, getReports, updateReport, deleteReport } = require("../controllers/reportController");


const router = express.Router();

// POST /api/reports
router.post("/", createReport);

// GET /api/reports
router.get("/", getReports);

// PUT /api/reports/:id
router.put("/:id", updateReport);

module.exports = router;
