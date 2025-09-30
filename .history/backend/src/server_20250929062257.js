// src/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS for your frontend
app.use(
  cors({
    origin: "http://localhost:5173", // replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes")); // ✅ Added for signup/login
app.use("/api/onboarding", require("./routes/onboardingRoutes")); // ✅ fixed filename
app.use("/api/reports", require("./routes/reportRoutes"));

// Health check (optional)
app.get("/", (req, res) => {
  res.send("Cloudsentrics API is running 🚀");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
