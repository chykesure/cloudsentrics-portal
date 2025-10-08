const express = require("express");
const router = express.Router();
const { createRequest, assignEngineer } = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware"); // optional

// ✅ Create a new request
router.post("/", protect, createRequest);

// ✅ Assign engineer to a request
router.post("/assign", protect, assignEngineer);

module.exports = router;
