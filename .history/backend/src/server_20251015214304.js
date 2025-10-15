// src/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db"); // your MongoDB connection
const { getDashboardData } = require("./controllers/dashboardController");
const { getAdminDashboard } = require("./controllers/adminDashboard"); // add this

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS for frontend
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically (profile images etc.)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ------------------ Routes ------------------

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));


// Onboarding routes
app.use("/api/onboarding", require("./routes/onboarding"));

// Reports & Requests
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));

// Profile (protected)


// Profile (protected)
const { protect } = require("./middleware/authMiddleware");
app.use("/api/profile", protect, require("./routes/profileRoutes"));


// Dashboard (Jira + stats)
app.use("/api/dashboard", (req, res) => getDashboardData(req, res));

app.use("/api/admin/dashboard", authMiddleware, (req, res) => getAdminDashboard(req, res));

const staffRoutes = require("./routes/staffRoutes");
app.use("/api/admin/staff", staffRoutes);

app.use("/api/staff/auth", require("./routes/staffAuthRoutes"));

// Health check
app.get("/", (req, res) => res.send("Cloudsentrics API is running 🚀"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err);
  res.status(500).json({ message: "Server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
