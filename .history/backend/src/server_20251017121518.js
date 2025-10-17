// src/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { protect } = require("./middleware/authMiddleware");

// Controllers
const { getDashboardData } = require("./controllers/dashboardController");
const { getAdminDashboard } = require("./controllers/adminDashboard");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// -------------------- MIDDLEWARE --------------------
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5000'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// -------------------- ROUTES --------------------

// 🔐 Authentication
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/staff/auth", require("./routes/staffAuthRoutes"));

// 👤 Profile (protected)
app.use("/api/profile", protect, require("./routes/profileRoutes"));

// 🧑‍💼 Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/staff", require("./routes/staffRoutes"));
app.use("/api/admin/dashboard", protect, (req, res) => getAdminDashboard(req, res));

// 🚀 Onboarding
app.use("/api/onboarding", require("./routes/onboarding"));

// 📝 Reports & Requests
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));

// 📊 Dashboard (user)
app.use("/api/dashboard", (req, res) => getDashboardData(req, res));

// -------------------- HEALTH CHECK --------------------
app.get("/", (req, res) => {
  res.send("🌥️ Cloudsentrics API is running 🚀");
});

// -------------------- ERROR HANDLERS --------------------

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("💥 Server error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});

// -------------------- START SERVER --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
