const mongoose = require("mongoose");

// Helper function to generate random customer ID
function generateCustomerId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CS-${randomStr}`;
}

const OnboardingSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  companyInfo: { type: Object, required: true },
  awsSetup: { type: Object, required: true },
  agreements: { type: Object, required: true },
  customerId: { type: String, required: true, unique: true, default: generateCustomerId },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Onboarding", OnboardingSchema);
