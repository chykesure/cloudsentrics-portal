const express = require("express");
const router = express.Router();
const { handleStatusUpdate } = require("../controllers/jiraWebhookController");

// Jira webhook endpoint
router.post("/status-update", handleStatusUpdate);

module.exports = router;
