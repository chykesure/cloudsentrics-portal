const express = require("express");
const { createReport, getReports, updateReport } = require("../controllers/reportController");


const router = express.Router();

// POST /api/reports
router.post("/", createReport);

// GET /api/reports
router.get("/", getReports);

module.exports = router;
