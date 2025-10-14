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
  companyInfo: {
    companyName: { type: String, required: false },
    companyEmail: { type: String, required: true, unique: true },
    primaryName: { type: String },
    primaryPhone: { type: String },
    primaryEmail: { type: String },
    secondaryName: { type: String },
    secondaryPhone: { type: String },
    secondaryEmail: { type: String },
  },
  awsSetup: { type: Object, default: {} },
  agreements: { type: Object, default: {} },
  avatar: { type: String, default: "" }, // ✅ Added avatar field
  customerId: {
    type: String,
    required: true,
    unique: true,
    default: generateCustomerId,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Onboarding", OnboardingSchema);
