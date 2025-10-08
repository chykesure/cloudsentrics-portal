// src/controllers/profileController.js
const Onboarding = require("../models/Onboarding");
const ReportModel = require("../models/Report");
const path = require("path");
const fs = require("fs");

// GET profile by email
exports.getProfile = async (req, res) => {
  try {
    const email = req.params.email;

    const onboard = await Onboarding.findOne({ "companyInfo.primaryEmail": email });
    if (!onboard) return res.status(404).json({ message: "User not found" });

    const report = await ReportModel.findOne({ email });

    res.json({
      name: onboard.companyInfo.primaryName,
      email: onboard.companyInfo.primaryEmail,
      customerId: onboard.agreements.customerId,
      phone: onboard.companyInfo.primaryPhone,
      tier: report && report.tier ? report.tier : "",
      storage: report && report.storage ? report.storage : "",
      avatar: onboard.avatar || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST update profile
exports.updateProfile = async (req, res) => {
  try {
    const email = req.params.email;
    const { name, phone } = req.body;

    let avatarPath;
    if (req.file) {
      const uploadsDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
      avatarPath = `/uploads/${req.file.filename}`;
    }

    const updatedOnboard = await Onboarding.findOneAndUpdate(
      { "companyInfo.primaryEmail": email },
      {
        "companyInfo.primaryName": name,
        "companyInfo.primaryPhone": phone,
        ...(avatarPath ? { avatar: avatarPath } : {}),
      },
      { new: true }
    );

    if (!updatedOnboard) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully",
      profile: updatedOnboard,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
