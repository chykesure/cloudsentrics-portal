const express = require("express");
const { createReport } = require("../controllers/reportController");

const router = express.Router();

// POST /api/reports
router.post("/", createReport);

module.exports = router;
