const express = require("express");
const { getDashboardData } = require("../controllers/dashboardController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// GET /api/dashboard
router.get("/", authMiddleware, getDashboardData);

module.exports = router;
