// src/controllers/profileController.js
const Onboarding = require("../models/Onboarding");
const Request = require("../models/Request"); // ✅ Use the requests table model
const path = require("path");
const fs = require("fs");

// GET profile by email
exports.getProfile = async (req, res) => {
  try {
    const email = req.params.email;

    // Fetch onboarding data
    const onboard = await Onboarding.findOne({ "companyInfo.primaryEmail": email });
    if (!onboard) return res.status(404).json({ message: "User not found" });

    // Fetch latest request record
    const request = await Request.findOne({ reporterEmail: email }).sort({ createdAt: -1 });

    // Tier map (same logic as createRequest)
    const tierMap = {
      standard: { title: "STANDARD TIER", storage: "200GB" },
      business: { title: "BUSINESS TIER", storage: "400GB" },
      premium: { title: "PREMIUM TIER", storage: "2TB" },
    };

    let tierTitle = "";
    let tierStorage = "";

    if (request?.selectedTier) {
      const tierDetails = tierMap[request.selectedTier.toLowerCase()];
      if (tierDetails) {
        tierTitle = tierDetails.title;
        tierStorage = tierDetails.storage;
      }
    }

    res.json({
      name: onboard.companyInfo.primaryName,
      companyEmail: onboard.companyInfo.primaryEmail,
      customerId: onboard.agreements.customerId,
      phone: onboard.companyInfo.primaryPhone,
      tier: tierTitle,
      storage: tierStorage,
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

    // Fetch latest request for tier info
    const request = await Request.findOne({ reporterEmail: email }).sort({ createdAt: -1 });

    // Tier map again
    const tierMap = {
      standard: { title: "STANDARD TIER", storage: "200GB" },
      business: { title: "BUSINESS TIER", storage: "400GB" },
      premium: { title: "PREMIUM TIER", storage: "2TB" },
    };

    let tierTitle = "";
    let tierStorage = "";

    if (request?.selectedTier) {
      const tierDetails = tierMap[request.selectedTier.toLowerCase()];
      if (tierDetails) {
        tierTitle = tierDetails.title;
        tierStorage = tierDetails.storage;
      }
    }

    res.json({
      message: "Profile updated successfully",
      profile: {
        name: updatedOnboard.companyInfo.primaryName,
        companyEmail: updatedOnboard.companyInfo.primaryEmail,
        customerId: updatedOnboard.agreements.customerId,
        phone: updatedOnboard.companyInfo.primaryPhone,
        tier: tierTitle,
        storage: tierStorage,
        avatar: updatedOnboard.avatar || "",
      },
    });
  } catch (err) {
    console.error("UPDATE profile error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};
