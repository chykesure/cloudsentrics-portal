const express = require("express");
const { adminLogin } = require("../controllers/adminController");

const router = express.Router();

// POST /api/admin/login
router.post("/login", adminLogin);

module.exports = router;
