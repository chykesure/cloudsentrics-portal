const Onboarding = require("../models/Onboarding");
const { generateCustomerId } = require("../utils/generateCustomerId");

exports.createOnboarding = async (req, res) => {
  try {
    const { companyInfo, awsSetup, agreements, userId } = req.body;

    if (!companyInfo || !awsSetup || !agreements) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const customerId = generateCustomerId();
    const createdAt = new Date().toISOString();

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
};
