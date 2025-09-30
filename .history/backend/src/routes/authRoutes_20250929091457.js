const express = require("express");
const router = express.Router();

// Import all controllers in one go
const {
  signup,
  login,
  validateAccount
} = require("../controllers/authController");

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// Validate account route
router.get("/validate-account/:accountId", validateAccount);

module.exports = router;
