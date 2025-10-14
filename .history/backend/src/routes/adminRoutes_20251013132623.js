const express = require("express");
const { adminLogin, createAdmin } = require("../controllers/adminController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", adminLogin);

// create admin - protected + only super-admin allowed
router.post("/create", authMiddleware, async (req, res, next) => {
  // quick role guard
  if (req.admin?.role !== "super-admin") {
    return res.status(403).json({ message: "Forbidden - super-admin required" });
  }
  next();
}, createAdmin);

module.exports = router;
