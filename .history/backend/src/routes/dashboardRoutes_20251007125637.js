const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const router = express.Router();

// Fetch dashboard for all reports (no email filter)
router.get("/", getDashboard);

module.exports = router;
