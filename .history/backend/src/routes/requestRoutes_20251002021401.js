const express = require("express");
const router = express.Router();
const { createRequest} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware"); // ✅ if you want only logged-in users

// Create a new request (Step1–Step6)
router.post("/", createRequest);

// Get all requests for the logged-in user
router.get("/", getRequests);

module.exports = router;
