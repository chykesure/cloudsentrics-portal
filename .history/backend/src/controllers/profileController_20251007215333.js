// src/controllers/profileController.js
const Onboarding = require("../models/Onboarding");
const Request = require("../models/Request");
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

    // 🧩 Find the latest request by email (if exists)
    const latestRequest = await Request.findOne({ reporterEmail: email }).sort({
      createdAt: -1,
    });

    // 🧩 Determine tier info
    let tierTitle = "";
    let tierStorage = "";

    if (latestRequest) {
      // If tierTitle and tierStorage exist in request, use them
      if (latestRequest.tierTitle && latestRequest.tierStorage) {
        tierTitle = latestRequest.tierTitle;
        tierStorage = latestRequest.tierStorage;
      } else if (latestRequest.selectedTier) {
        // Otherwise, fallback to default mapping
        const tierMap = {
          standard: { title: "STANDARD TIER", storage: "200GB" },
          business: { title: "BUSINESS TIER", storage: "400GB" },
          premium: { title: "PREMIUM TIER", storage: "2TB" },
        };
        const tierDetails = tierMap[latestRequest.selectedTier.toLowerCase()];
        if (tierDetails) {
          tierTitle = tierDetails.title;
          tierStorage = tierDetails.storage;
        }
      }
    }

    // 🧩 Send profile response
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

// ✅ PUT update profile (unchanged)
exports.updateProfile = async (req, res) => {
  try {
    const email = req.params.email;
    const { name, phone } = req.body;

    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    let avatarPath = null;
    if (req.file) {
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

    const latestRequest = await Request.findOne({ reporterEmail: email }).sort({ createdAt: -1 });

    let tierTitle = "";
    let tierStorage = "";

    if (latestRequest) {
      if (latestRequest.tierTitle && latestRequest.tierStorage) {
        tierTitle = latestRequest.tierTitle;
        tierStorage = latestRequest.tierStorage;
      } else if (latestRequest.selectedTier) {
        const tierMap = {
          standard: { title: "STANDARD TIER", storage: "200GB" },
          business: { title: "BUSINESS TIER", storage: "400GB" },
          premium: { title: "PREMIUM TIER", storage: "2TB" },
        };
        const tierDetails = tierMap[latestRequest.selectedTier.toLowerCase()];
        if (tierDetails) {
          tierTitle = tierDetails.title;
          tierStorage = tierDetails.storage;
        }
      }
    }

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
