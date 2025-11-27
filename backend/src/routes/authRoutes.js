// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Signup
router.post("/signup", authController.signup);

// Login
router.post("/login", authController.login);

// Validate account
router.get("/validate-account/:accountId", authController.validateAccount);

// Recover Customer ID
router.post("/recover-customer-id", authController.recoverCustomerId);

// Change Password
router.post("/change-password", authController.changePassword);

// Forgot Password
router.post("/forgot-password", authController.forgotPassword);

// Reset Password
router.post("/reset-password", authController.resetPassword);


module.exports = router;
