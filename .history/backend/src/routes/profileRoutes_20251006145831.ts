import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer setup for avatar upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Routes
router.get("/profile/:email", getProfile);
router.post("/profile/update/:email", upload.single("avatar"), updateProfile);

export default router;
