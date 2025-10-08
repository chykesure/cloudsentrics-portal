// src/controllers/profileController.js
const Onboarding = require("../models/Onboarding");
const Request = require("../models/Request"); // ✅ linked to requests table
const path = require("path");
const fs = require("fs");

// ✅ GET profile by email

exports.getProfile = async (req, res) => {
  try {
    const email = req.params.email;

    // 🧩 Find user in onboarding table
    const onboard = await Onboarding.findOne({
      "companyInfo.primaryEmail": email,
    });

    if (!onboard) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🧩 Find the latest request with tierTitle and tierStorage
    const latestRequest = await Request.findOne({
      reporterEmail: email,
      tierTitle: { $exists: true, $ne: "" },
      tierStorage: { $exists: true, $ne: "" },
    }).sort({ createdAt: -1 }); // most recent first

    // Default to empty if no request found
    const tierTitle = latestRequest?.tierTitle || "";
    const tierStorage = latestRequest?.tierStorage || "";

    // 🧩 Send response
    res.json({
      name: onboard.companyInfo.primaryName,
      companyEmail: onboard.companyInfo.primaryEmail,
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


// ✅ PUT update profile
exports.updateProfile = async (req, res) => {
  try {
    const email = req.params.email;
    const { name, phone } = req.body;

    // 🧩 Ensure uploads folder exists
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    // 🧩 Handle avatar if uploaded
    let avatarPath = null;
    if (req.file) {
      avatarPath = `/uploads/${req.file.filename}`;
    }

    // 🧩 Update Onboarding data
    const updatedOnboard = await Onboarding.findOneAndUpdate(
      { "companyInfo.primaryEmail": email },
      {
        "companyInfo.primaryName": name,
        "companyInfo.primaryPhone": phone,
        ...(avatarPath ? { avatar: avatarPath } : {}),
      },
      { new: true }
    );

    if (!updatedOnboard)
      return res.status(404).json({ message: "User not found" });

    // 🧩 Get tier info again from Request table
    const request = await Request.findOne({ reporterEmail: email }).sort({
      createdAt: -1,
    });

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

    // 🧩 Return updated data
    res.json({
      message: "Profile updated successfully",
      profile: {
        name: updatedOnboard.companyInfo.primaryName,
        companyEmail: updatedOnboard.companyInfo.primaryEmail,
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
