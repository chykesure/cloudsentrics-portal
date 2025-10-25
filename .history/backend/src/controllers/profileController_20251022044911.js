// src/controllers/profileController.js
const Onboarding = require("../models/Onboarding");
const Request = require("../models/Request");
const path = require("path");
const fs = require("fs");

// ---------- Helper ----------
const getTierInfo = (latestRequest) => {
  if (!latestRequest) {
    return { title: "No tier selected", storage: "—" };
  }

  // 1️⃣ Direct tier info from request
  if (latestRequest.tierTitle && latestRequest.tierStorage) {
    return {
      title: latestRequest.tierTitle,
      storage: latestRequest.tierStorage,
    };
  }

  // 2️⃣ Selected tier string
  if (latestRequest.selectedTier) {
    const tierMap = {
      standard: { title: "STANDARD TIER", storage: "300GB" },
      business: { title: "BUSINESS TIER", storage: "600GB" },
      premium: { title: "PREMIUM TIER", storage: "2TB" },
    };

    let tierKey = latestRequest.selectedTier.toLowerCase().trim();
    if (tierKey.includes("standard")) tierKey = "standard";
    else if (tierKey.includes("business")) tierKey = "business";
    else if (tierKey.includes("premium")) tierKey = "premium";
    else return { title: "No tier selected", storage: "—" };

    return tierMap[tierKey] || { title: "No tier selected", storage: "—" };
  }

  // 3️⃣ Fallback using selectedStorageCount
  if (latestRequest.selectedStorageCount) {
    const count = latestRequest.selectedStorageCount;
    if (count >= 5) return { title: "PREMIUM TIER", storage: "2TB" };
    if (count >= 3) return { title: "BUSINESS TIER", storage: "600GB" };
    return { title: "STANDARD TIER", storage: "300GB" };
  }

  // 🟡 Default if no info
  return { title: "No tier selected", storage: "" };
};


// ---------- GET /api/profile/me ----------
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    const email =
      user.companyEmail ||
      user.email ||
      user.companyInfo?.companyEmail ||
      user.companyInfo?.primaryEmail;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found in user record",
      });
    }

    const onboard = await Onboarding.findOne({
      "companyInfo.companyEmail": email,
    });

    // ✅ Get most recent request for this user
    const latestRequest = await Request.findOne({
      reporterEmail: email,
    })
      .sort({ createdAt: -1 })
      .lean();

    const tierInfo = getTierInfo(latestRequest);

    const profile = {
      name:
        onboard?.companyInfo?.primaryName ||
        user.name ||
        email.split("@")[0],
      companyEmail: email,
      phone: onboard?.companyInfo?.primaryPhone || user.phone || "",
      tier: tierInfo.title,
      storage: tierInfo.storage,
      avatar: onboard?.avatar
        ? onboard.avatar.startsWith("http")
          ? onboard.avatar
          : `${onboard.avatar}`
        : "",
    };

    res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("GET profile error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching profile" });
  }
};

// ---------- PUT /api/profile/:email ----------
exports.updateProfile = async (req, res) => {
  try {
    const email = req.params.email;
    const { name, phone, companyName } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ message: "User email is required to update profile." });
    }

    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    let avatarPath = null;
    if (req.file) avatarPath = `/uploads/${req.file.filename}`;

    let onboard = await Onboarding.findOne({
      "companyInfo.companyEmail": email,
    });

    if (onboard) {
      onboard.companyInfo.primaryName =
        name || onboard.companyInfo.primaryName;
      onboard.companyInfo.primaryPhone =
        phone || onboard.companyInfo.primaryPhone;
      onboard.companyInfo.companyName =
        companyName || onboard.companyInfo.companyName;
      if (avatarPath) onboard.avatar = avatarPath;
      await onboard.save();
    } else {
      onboard = await Onboarding.create({
        companyInfo: {
          primaryName: name || "Unnamed User",
          primaryEmail: email,
          primaryPhone: phone || "",
          companyEmail: email,
          companyName: companyName || "Default Company",
        },
        avatar: avatarPath || "",
        agreements: [],
        awsSetup: false,
      });
    }

    const latestRequest = await Request.findOne({
      reporterEmail: email,
      $or: [
        { selectedTier: { $exists: true, $ne: null } },
        { tierTitle: { $exists: true, $ne: null } },
      ],
    })
      .sort({ _id: -1 })
      .lean();


    const tierInfo = getTierInfo(latestRequest);

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        name: onboard.companyInfo.primaryName,
        companyEmail: onboard.companyInfo.companyEmail,
        companyName: onboard.companyInfo.companyName,
        phone: onboard.companyInfo.primaryPhone,
        tier: tierInfo.title,
        storage: tierInfo.storage,
        avatar: onboard.avatar || "",
      },
    });
  } catch (err) {
    console.error("UPDATE profile error:", err);
    res
      .status(500)
      .json({ message: "Server error while updating profile" });
  }
};
