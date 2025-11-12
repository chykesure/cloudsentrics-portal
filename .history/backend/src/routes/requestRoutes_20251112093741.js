// src/routes/requestR

const express = require("express");
const router = express.Router();
const { createRequest, getRequestByEmail} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware"); // ✅ if you want only logged-in users

// Create a new request (Step1–Step6)
router.post("/", createRequest);

// ✅ Fetch request by reporterEmail
router.get("/by-email/:email", getRequestByEmail);


module.exports = router;
