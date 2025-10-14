const express = require("express");
const { adminLogin, createAdmin } = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware"); // default import
const router = express.Router();

// Admin login (public)
router.post("/login", adminLogin);

// Create admin - protected, only super-admin allowed
router.post(
  "/create",
  authMiddleware,
  async (req, res, next) => {
    if (req.admin?.role !== "super-admin") {
      return res.status(403).json({ message: "Forbidden - super-admin required" });
    }
    next();
  },
  createAdmin
);

module.exports = router;
