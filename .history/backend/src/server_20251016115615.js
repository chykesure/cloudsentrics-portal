// src/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const { getDashboardData } = require("./controllers/dashboardController");
const { getAdminDashboard } = require("./controllers/adminDashboard");
const { protect } = require("./middleware/authMiddleware");

// Load env
dotenv.config();

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// -------------------- ROUTES --------------------

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));

// Onboarding
app.use("/api/onboarding", require("./routes/onboarding"));

// Reports & requests
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));

// Profile routes (protected)
app.use("/api/profile", protect, require("./routes/profileRoutes"));

// Staff routes
app.use("/api/admin/staff", require("./routes/staffRoutes"));
app.use("/api/staff/auth", require("./routes/staffAuthRoutes"));

// Dashboard
app.use("/api/dashboard", (req, res) => getDashboardData(req, res));
app.use("/api/admin/dashboard", protect, (req, res) => getAdminDashboard(req, res));

app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => res.send("Cloudsentrics API is running 🚀"));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err);
  res.status(500).json({ message: "Server error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
