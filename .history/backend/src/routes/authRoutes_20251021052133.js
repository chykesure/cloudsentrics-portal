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

//Recover Customer ID ROute
router.post("/recover-customer-id", authControllerrecoverCustomerId); // 🔹 New route

module.exports = router;
