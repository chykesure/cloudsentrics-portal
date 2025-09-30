const express = require("express");
const router = express.Router();
const Onboarding = require("../models/Onboarding");

// Helper function to generate Customer ID
function generateCustomerId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CS-${randomStr}`;
}

// POST /api/onboarding
router.post("/", async (req, res) => {
  try {
    const { companyInfo, awsSetup, agreements, userId } = req.body;

    if (!companyInfo || !awsSetup || !agreements || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const customerId = generateCustomerId();
    const createdAt = new Date();

    const newOnboarding = new Onboarding({
      companyInfo,
      awsSetup,
      agreements,
      userId,
      customerId,
      createdAt,
    });

    await newOnboarding.save();

    res.status(201).json({ message: "Onboarding saved", customerId });
  } catch (error) {
    console.error("Error saving onboarding:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
