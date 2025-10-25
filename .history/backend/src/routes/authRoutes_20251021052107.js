// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

// ✅ Validate account route
router.get("/validate-account/:accountId", authController.validateAccount);

//Recover Customer ID
router.post("/recover-customer-id", recoverCustomerId); // 🔹 New route

module.exports = router;
