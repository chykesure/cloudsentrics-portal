// src/routes/profileRoutes.ts
import express from "express";
import multer from "multer";
import * as pathModule from "path"; // ✅ renamed to avoid TS conflict
import { getProfile, updateProfile } from "../controllers/profileController";

const router = express.Router();

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = pathModule.join(__dirname, "../../uploads");
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = pathModule.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Routes

// GET profile by email
router.get("/:email", getProfile);

// POST update profile (with avatar upload)
router.post("/update/:email", upload.single("avatar"), updateProfile);

export default router;
