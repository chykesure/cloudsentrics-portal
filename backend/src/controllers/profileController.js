// src/controllers/profileController.js
const Onboarding = require("../models/Onboarding");
const Request = require("../models/Request");
const path = require("path");
const fs = require("fs");

// Helper to determine tier info from latest request
const getTierInfo = (latestRequest) => {
  const defaultTier = { title: "STANDARD TIER", storage: "200GB" };
  if (!latestRequest) return defaultTier;

  if (latestRequest.tierTitle && latestRequest.tierStorage) {
    return { title: latestRequest.tierTitle, storage: latestRequest.tierStorage };
  }

  if (latestRequest.selectedTier) {
    const tierMap = {
      standard: { title: "STANDARD TIER", storage: "200GB" },
      business: { title: "BUSINESS TIER", storage: "400GB" },
      premium: { title: "PREMIUM TIER", storage: "2TB" },
    };

    let tierKey = latestRequest.selectedTier.toLowerCase().trim();
    if (tierKey.includes("standard")) tierKey = "standard";
    else if (tierKey.includes("business")) tierKey = "business";
    else if (tierKey.includes("premium")) tierKey = "premium";
    else tierKey = "standard";

    return tierMap[tierKey] || defaultTier;
  }

  return defaultTier;
};

// ✅ GET profile by email
exports.getProfile = async (req, res) => {
  try {
    const email = req.params.email;

    // Fetch onboarding record by companyEmail only
    const onboard = await Onboarding.findOne({ "companyInfo.companyEmail": email });

    // Fetch latest request for tier info
    const latestRequest = await Request.findOne({ reporterEmail: email }).sort({ createdAt: -1 });
    const tierInfo = getTierInfo(latestRequest);

    const profile = {
      name: onboard?.companyInfo?.primaryName || email.split("@")[0],
      companyEmail: onboard?.companyInfo?.companyEmail || email,
      phone: onboard?.companyInfo?.primaryPhone || "",
      tier: tierInfo.title,
      storage: tierInfo.storage,
      avatar: onboard?.avatar || "",
    };

    res.json(profile);
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

    if (!email) {
      return res.status(400).json({ message: "User email is required to update profile." });
    }

    // Ensure uploads folder exists
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    let avatarPath = null;
    if (req.file) avatarPath = `/uploads/${req.file.filename}`;

    // Fetch onboarding record by companyEmail only
    let onboard = await Onboarding.findOne({ "companyInfo.companyEmail": email });

    if (onboard) {
      onboard.companyInfo.primaryName = name || onboard.companyInfo.primaryName;
      onboard.companyInfo.primaryPhone = phone || onboard.companyInfo.primaryPhone;
      if (avatarPath) onboard.avatar = avatarPath;
      await onboard.save();
    } else {
      // Create new onboarding record safely
      onboard = await Onboarding.create({
        companyInfo: {
          primaryName: name || "Unnamed User",
          primaryEmail: email, // optional
          primaryPhone: phone || "",
          companyEmail: email,
          companyName: "Default Company Name",
        },
        avatar: avatarPath || "",
        agreements: [],
        awsSetup: false,
      });
    }

    // Fetch latest request for tier info
    const latestRequest = await Request.findOne({ reporterEmail: email }).sort({ createdAt: -1 });
    const tierInfo = getTierInfo(latestRequest);

    res.json({
      message: "Profile updated successfully",
      profile: {
        name: onboard.companyInfo.primaryName,
        companyEmail: onboard.companyInfo.companyEmail,
        phone: onboard.companyInfo.primaryPhone,
        tier: tierInfo.title,
        storage: tierInfo.storage,
        avatar: onboard.avatar || "",
      },
    });
  } catch (err) {
    console.error("UPDATE profile error:", err);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};