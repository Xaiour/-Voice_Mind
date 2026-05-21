import { Router } from "express";
import { VoiceController } from "../controllers/voice.controller";
import { authenticate } from "../middleware/auth";
import { uploadAudio } from "../config/multer";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

// All voice routes are protected
router.use(authenticate);

// ─── Routes ─────────────────────────────────────────────────

// Upload audio file (rate limited: 10 uploads per 15 min)
router.post(
  "/upload",
  rateLimiter(10, 900),
  uploadAudio.single("audio"),
  VoiceController.upload
);

// Trigger analysis on existing audio
router.post("/analyze", VoiceController.analyze);

// Get analysis history
router.get("/history", VoiceController.getHistory);

// Get single analysis result
router.get("/analysis/:id", VoiceController.getAnalysis);

export default router;
