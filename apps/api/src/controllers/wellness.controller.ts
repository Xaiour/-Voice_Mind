import { Request, Response } from "express";
import { WellnessInsightsService, VoiceMetricsInput } from "../services/wellness-insights.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

/**
 * Wellness Controller — handles AI-powered emotional wellness insights.
 */
export class WellnessController {
  /**
   * POST /api/wellness/insights
   * Generate personalized wellness insights from voice analysis scores.
   *
   * Body: { stress_score, anxiety_score, depression_score, pitch_variability,
   *         speech_rate, energy, pause_ratio, jitter, emotion?, confidence? }
   */
  static generateInsights = asyncHandler(async (req: Request, res: Response) => {
    const {
      stress_score,
      anxiety_score,
      depression_score,
      pitch_variability,
      speech_rate,
      energy,
      pause_ratio,
      jitter,
      emotion,
      confidence,
    } = req.body;

    // Validate required fields
    if (
      stress_score === undefined ||
      anxiety_score === undefined ||
      depression_score === undefined
    ) {
      throw ApiError.badRequest(
        "Missing required fields: stress_score, anxiety_score, depression_score"
      );
    }

    const metrics: VoiceMetricsInput = {
      stress_score: clamp(Number(stress_score), 0, 100),
      anxiety_score: clamp(Number(anxiety_score), 0, 100),
      depression_score: clamp(Number(depression_score), 0, 100),
      pitch_variability: Number(pitch_variability) || 0,
      speech_rate: Number(speech_rate) || 0,
      energy: Number(energy) || 0,
      pause_ratio: clamp(Number(pause_ratio) || 0, 0, 1),
      jitter: Number(jitter) || 0,
      emotion: emotion || undefined,
      confidence: confidence ? clamp(Number(confidence), 0, 1) : undefined,
    };

    const insights = await WellnessInsightsService.generateInsights(metrics);

    res.status(200).json({
      success: true,
      data: {
        insights,
        input_scores: {
          stress: metrics.stress_score,
          anxiety: metrics.anxiety_score,
          depression: metrics.depression_score,
        },
        generated_at: new Date().toISOString(),
        disclaimer:
          "This is not a medical diagnosis. If you are struggling, please reach out to a mental health professional.",
      },
    });
  });

  /**
   * POST /api/wellness/quick-check
   * Lightweight endpoint — accepts only the 3 core scores.
   * Returns a simplified insight (summary + encouragement only).
   */
  static quickCheck = asyncHandler(async (req: Request, res: Response) => {
    const { stress_score, anxiety_score, depression_score } = req.body;

    if (
      stress_score === undefined ||
      anxiety_score === undefined ||
      depression_score === undefined
    ) {
      throw ApiError.badRequest(
        "Missing required fields: stress_score, anxiety_score, depression_score"
      );
    }

    const metrics: VoiceMetricsInput = {
      stress_score: clamp(Number(stress_score), 0, 100),
      anxiety_score: clamp(Number(anxiety_score), 0, 100),
      depression_score: clamp(Number(depression_score), 0, 100),
      pitch_variability: 0,
      speech_rate: 0,
      energy: 0,
      pause_ratio: 0,
      jitter: 0,
    };

    // Use fallback (no OpenAI call) for quick check — instant response
    const insights = WellnessInsightsService.getFallbackInsights(metrics);

    res.status(200).json({
      success: true,
      data: {
        summary: insights.emotional_summary,
        tone: insights.overall_tone,
        risk_level: insights.risk_level,
        top_suggestion: insights.wellness_suggestions[0] || "",
        encouragement: insights.encouragement,
      },
    });
  });
}

// ─── Helper ─────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
