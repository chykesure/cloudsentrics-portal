import express from "express";
import multer from "multer";
import path from "path";
import { createReport, getReports, updateReport, deleteReport, getReportById } from "../controllers/reportController.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/reports", upload.single("image"), createReport);
router.get("/reports", getReports);
router.get("/reports/:id", getReportById);
router.put("/reports/:id", updateReport);
router.delete("/reports/:id", deleteReport);

export default router;
