// src/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db"); // MongoDB connection
const { getDashboardData } = require("./controllers/dashboardController");
const { getAdminDashboard } = require("./controllers/adminDashboard");
const { protect } = require("./middleware/authMiddleware"); // ✅ fixed import

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically (for profile images etc.)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// -------------------- ROUTES --------------------

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
app.use("/api/profile", protect, require("./routes/profileRoutes"));

// Dashboard (Jira + stats)
app.use("/api/dashboard", (req, res) => getDashboardData(req, res));

// Admin dashboard (protected)
app.use("/api/admin/dashboard", protect, (req, res) => getAdminDashboard(req, res));

// Staff routes
const staffRoutes = require("./routes/staffRoutes");
app.use("/api/admin/staff", staffRoutes);

// Staff authentication routes
app.use("/api/staff/auth", require("./routes/staffAuthRoutes"));

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => res.send("Cloudsentrics API is running 🚀"));

// -------------------- 404 HANDLER --------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -------------------- ERROR HANDLER --------------------
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err);
  res.status(500).json({ message: "Server error" });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
