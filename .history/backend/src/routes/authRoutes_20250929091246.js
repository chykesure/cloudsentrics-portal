const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const  validateAccount  = require("../controllers/authController");

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/login", authController.login);

router.get("/validate-account/:accountId", validateAccount);

module.exports = router;
