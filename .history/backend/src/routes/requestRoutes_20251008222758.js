const express = require("express");
const router = express.Router(); // ✅ Correct
const { createRequest, assignEngineer } = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

// Create a new request
router.post("/", protect, createRequest);

// Assign engineer to a request
router.post("/assign", protect, assignEngineer);

module.exports = router;
