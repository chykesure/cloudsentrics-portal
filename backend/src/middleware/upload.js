// src/middleware/upload.js
const multer = require("multer");

// Store files in memory or on disk
const storage = multer.memoryStorage(); // or diskStorage
const upload = multer({ storage });

module.exports = upload;
