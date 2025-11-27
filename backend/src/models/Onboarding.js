// backend/src/models/Onboarding.js
const mongoose = require("mongoose");

function generateCustomerId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CS-${randomStr}`;
}

const OnboardingSchema = new mongoose.Schema(
  {
    companyInfo: {
      companyName: { type: String },
      companyEmail: { type: String, required: true, unique: true },
      primaryName: { type: String },
      primaryPhone: { type: String },
      primaryEmail: { type: String },
      secondaryName: { type: String },
      secondaryPhone: { type: String },
      secondaryEmail: { type: String },
    },

    awsSetup: { type: Object, default: {} },
    aliases: { type: Object, default: {} },
    agreements: { type: Object, default: {} },

    avatar: { type: String, default: "" },
    profileImage: { type: String, default: "" },

    customerId: {
      type: String,
      required: true,
      unique: true,
      default: generateCustomerId,
    },

    // Login credentials
    passwordHash: { type: String, required: true },
    tempPassword: { type: String },
    mustChangePassword: { type: Boolean, default: true },
    role: { type: String, enum: ["Admin", "User", "SuperAdmin"], default: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Onboarding", OnboardingSchema);
