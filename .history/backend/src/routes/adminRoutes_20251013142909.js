const express = require("express");
const router = express.Router();
const { adminLogin, createAdmin } = require("../controllers/adminController");
const { getAdminDashboard } = require("../controllers/adminDashboard");
const { verifyAdmin } = require("../middleware/authMiddleware");

router.post("/login", adminLogin);
router.post("/create", createAdmin);
router.get("/dashboard", verifyAdmin, getAdminDashboard);

module.exports = router;
