const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");   // ✅ Added this
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ✅ Allow requests from your frontend
app.use(cors({
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.use("/api/reports", require("./routes/reportRoutes"));

// Add this:
app.use("/api/onboarding", onboardingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
