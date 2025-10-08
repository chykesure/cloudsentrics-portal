import { Request as ExpressRequest, Response } from "express";
import { Onboard, Request as RequestModel } from "../models/User";
import path from "path";
import fs from "fs";

// GET profile
export const getProfile = async (req: ExpressRequest, res: Response) => {
  try {
    const email = req.params.email;

    // Fetch from onboard
    const onboard = await Onboard.findOne({ primaryEmail: email });
    if (!onboard) return res.status(404).json({ message: "User not found" });

    // Fetch tier/storage from request
    const request = await RequestModel.findOne({ email });
    
    return res.json({
      name: onboard.primaryName,
      email: onboard.primaryEmail,
      customerId: onboard.customerId,
      phone: onboard.primaryPhone,
      tier: request?.tier || "",
      storage: request?.storage || "",
      avatar: onboard.avatar || "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST update profile
export const updateProfile = async (req: ExpressRequest, res: Response) => {
  try {
    const email = req.params.email;
    const { name, phone } = req.body;

    // Handle avatar upload
    let avatarPath;
    if (req.file) {
      const uploadsDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

      avatarPath = `/uploads/${req.file.filename}`;
    }

    // Update onboard table
    const updatedOnboard = await Onboard.findOneAndUpdate(
      { primaryEmail: email },
      {
        primaryName: name,
        primaryPhone: phone,
        ...(avatarPath && { avatar: avatarPath }),
      },
      { new: true }
    );

    if (!updatedOnboard)
      return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated successfully",
      profile: updatedOnboard,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
