const Onboarding = require("../models/Onboarding");

const createOnboarding = async (req, res) => {
  try {
    const { userId, companyInfo, awsSetup, agreements } = req.body;

    if (!userId || !companyInfo || !awsSetup || !agreements) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOnboarding = new Onboarding({
      userId,
      companyInfo,
      awsSetup,
      agreements,
      // no need to generate customerId here
    });

    await newOnboarding.save();

    res.status(201).json({ message: "Onboarding saved", customerId: newOnboarding.customerId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createOnboarding };
