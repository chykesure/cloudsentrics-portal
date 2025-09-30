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

// Sub-schema for companyInfo
const CompanyInfoSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyEmail: { type: String, required: true, unique: true }, // ✅ enforce unique
  primaryName: { type: String },
  primaryPhone: { type: String },
  primaryEmail: { type: String },
  secondaryName: { type: String },
  secondaryPhone: { type: String },
  secondaryEmail: { type: String },
}, { _id: false }); // disable _id for sub-doc

const OnboardingSchema = new mongoose.Schema({
  companyInfo: { type: CompanyInfoSchema, required: true },
  awsSetup: { type: Object, required: true },
  agreements: { type: Object, required: true },
  customerId: {
    type: String,
    required: true,
    unique: true,
    default: generateCustomerId
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Onboarding", OnboardingSchema);
