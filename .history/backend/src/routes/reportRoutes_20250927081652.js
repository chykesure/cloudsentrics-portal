const express = require("express");
const router = express.Router();
const { createReport } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

// router.post("/", authMiddleware, createReport);
// 🚀 Skip auth for now
router.post("/", createReport);

module.exports = router;
