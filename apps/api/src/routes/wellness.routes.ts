import { Router } from "express";
import { WellnessController } from "../controllers/wellness.controller";
import { authenticate } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// All wellness routes are protected
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────

const insightsSchema = z.object({
  stress_score: z.number().min(0).max(100),
  anxiety_score: z.number().min(0).max(100),
  depression_score: z.number().min(0).max(100),
  pitch_variability: z.number().optional(),
  speech_rate: z.number().optional(),
  energy: z.number().optional(),
  pause_ratio: z.number().min(0).max(1).optional(),
  jitter: z.number().optional(),
  emotion: z.string().max(100).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

const quickCheckSchema = z.object({
  stress_score: z.number().min(0).max(100),
  anxiety_score: z.number().min(0).max(100),
  depression_score: z.number().min(0).max(100),
});

// ─── Routes ─────────────────────────────────────────────────

// Full AI-powered insights (rate limited: 20 per 15 min — OpenAI costs)
router.post(
  "/insights",
  rateLimiter(20, 900),
  validate({ body: insightsSchema }),
  WellnessController.generateInsights
);

// Quick check — instant, no OpenAI call (higher rate limit)
router.post(
  "/quick-check",
  rateLimiter(60, 900),
  validate({ body: quickCheckSchema }),
  WellnessController.quickCheck
);

export default router;
