import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import voiceRoutes from "./voice.routes";
import aiRoutes from "./ai.routes";
import wellnessRoutes from "./wellness.routes";

const router = Router();

// ─── Health Check ───────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "voicemind-api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Route Registration ─────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/voice", voiceRoutes);
router.use("/ai", aiRoutes);
router.use("/wellness", wellnessRoutes);

export default router;
