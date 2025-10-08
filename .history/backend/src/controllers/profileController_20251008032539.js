// src/controllers/profileController.js
const Onboarding = require("../models/Onboarding");
const Request = require("../models/Request");

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

    // 🧩 Find latest request by email
    const latestRequest = await Request.findOne({ reporterEmail: email }).sort({
      createdAt: -1,
    });

    // 🧩 Determine tier info
    let tierTitle = "STANDARD TIER"; // default
    let tierStorage = "200GB";       // default

    if (latestRequest) {
      // Use explicit tier info if available
      if (latestRequest.tierTitle && latestRequest.tierStorage) {
        tierTitle = latestRequest.tierTitle;
        tierStorage = latestRequest.tierStorage;
      } else if (latestRequest.selectedTier) {
        // Fallback mapping (handles messy capitalization)
        const tierMap = {
          standard: { title: "STANDARD TIER", storage: "200GB" },
          business: { title: "BUSINESS TIER", storage: "400GB" },
          premium: { title: "PREMIUM TIER", storage: "2TB" },
        };

        let tierKey = latestRequest.selectedTier.toLowerCase().trim();
        if (tierKey.includes("standard")) tierKey = "standard";
        else if (tierKey.includes("business")) tierKey = "business";
        else if (tierKey.includes("premium")) tierKey = "premium";
        else tierKey = "standard"; // fallback

        const tierDetails = tierMap[tierKey];
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
