const express = require("express");
const { getDashboard } = require("../controllers/dashboardController");
const router = express.Router();

router.get("/:email", getDashboard);

module.exports = router;
