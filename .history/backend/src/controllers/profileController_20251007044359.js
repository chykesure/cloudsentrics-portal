// src/controllers/profileController.js
const Onboarding = require("../models/Onboarding");
const ReportModel = require("../models/Report");
const path = require("path");
const fs = require("fs");

// Serve uploads folder (make sure in your main server file you have:
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// GET profile by email
exports.getProfile = async (req, res) => {
  try {
    const email = req.params.email;

    // Fetch onboarding data
    const onboard = await Onboarding.findOne({ "companyInfo.primaryEmail": email });
    if (!onboard) return res.status(404).json({ message: "User not found" });

    // Fetch latest report/request for tier and storage
    const report = await ReportModel.findOne({ email }).sort({ createdAt: -1 });

    res.json({
      name: onboard.companyInfo.primaryName,
      companyEmail: onboard.companyInfo.primaryEmail,
      customerId: onboard.agreements.customerId,
      phone: onboard.companyInfo.primaryPhone,
      tier: report?.selectedTier || report?.tier || "",
      storage: report?.selectedStorageCount?.toString() || report?.storage?.toString() || "",
      avatar: onboard.avatar || "",
    });
  } catch (err) {
    console.error("GET profile error:", err);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
};

// PUT update profile
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

    // Fetch latest report after update to return tier/storage
    //const report = await ReportModel.findOne({ email }).sort({ createdAt: -1 });
    const report = await ReportModel.findOne({ reporterEmail: email }).sort({ createdAt: -1 });


    res.json({
      message: "Profile updated successfully",
      profile: {
        name: updatedOnboard.companyInfo.primaryName,
        companyEmail: updatedOnboard.companyInfo.primaryEmail,
        customerId: updatedOnboard.agreements.customerId,
        phone: updatedOnboard.companyInfo.primaryPhone,
        tier: report?.selectedTier || report?.tier || "",
        storage: report?.selectedStorageCount?.toString() || report?.storage?.toString() || "",
        avatar: updatedOnboard.avatar || "",
      },
    });
  } catch (err) {
    console.error("UPDATE profile error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};
