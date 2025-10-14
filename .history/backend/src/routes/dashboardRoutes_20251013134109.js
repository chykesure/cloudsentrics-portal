// src/routes/dashboardRoutes.js (or inline in server.js)
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getDashboardData } = require("../controllers/dashboardController");

const router = express.Router();

// protect route
router.get("/", authMiddleware, getDashboardData);

module.exports = router;
