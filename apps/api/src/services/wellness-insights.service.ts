import { openai, OPENAI_MODEL } from "../config/openai";
import { redis } from "../config/redis";
import { logger } from "../utils/logger";
import crypto from "crypto";

// ─── Types ──────────────────────────────────────────────────

export interface VoiceMetricsInput {
  stress_score: number;       // 0-100
  anxiety_score: number;      // 0-100
  depression_score: number;   // 0-100
  pitch_variability: number;  // Hz std deviation
  speech_rate: number;        // syllables/sec
  energy: number;             // RMS amplitude
  pause_ratio: number;        // 0-1
  jitter: number;             // pitch perturbation
  emotion?: string;           // detected primary emotion
  confidence?: number;        // 0-1
}

export interface WellnessInsight {
  emotional_summary: string;
  wellness_suggestions: string[];
  calming_recommendations: string[];
  hydration_reminder: string;
  sleep_recommendation: string;
  overall_tone: "positive" | "neutral" | "concerning";
  risk_level: "low" | "moderate" | "high";
  encouragement: string;
}

// ─── Prompt Engineering ─────────────────────────────────────

const SYSTEM_PROMPT = `You are VoiceMind Wellness AI — a supportive, emotionally intelligent wellness companion for mental health awareness.

ROLE:
You generate personalized wellness insights based on voice biomarker analysis data. Your tone is warm, non-judgmental, supportive, and healthcare-safe. You NEVER diagnose conditions or replace professional care.

GUIDELINES:
- Be empathetic and validating ("It's understandable to feel this way")
- Use gentle, calming language
- Avoid clinical jargon — speak like a caring friend who understands wellness
- Always include actionable, simple suggestions
- Frame observations positively when possible ("Your voice shows resilience" vs "Your voice shows stress")
- If scores are concerning (>70), gently encourage professional support
- Keep all suggestions safe, evidence-based, and universally applicable
- Never use alarmist language
- Always end with encouragement

IMPORTANT SAFETY RULES:
- You are NOT a therapist or doctor
- Never say "you have depression/anxiety/stress disorder"
- Use phrases like "your voice patterns suggest..." or "you may be experiencing..."
- Always include: "This is not a medical diagnosis. If you're struggling, please reach out to a mental health professional."

OUTPUT FORMAT:
Respond ONLY in valid JSON matching this exact schema:
{
  "emotional_summary": "<2-3 sentences describing emotional state in warm, supportive language>",
  "wellness_suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "calming_recommendations": ["<calming activity 1>", "<calming activity 2>"],
  "hydration_reminder": "<personalized hydration tip based on energy/stress levels>",
  "sleep_recommendation": "<sleep advice based on detected fatigue or stress>",
  "overall_tone": "<positive|neutral|concerning>",
  "risk_level": "<low|moderate|high>",
  "encouragement": "<uplifting closing message>"
}`;

function buildUserPrompt(metrics: VoiceMetricsInput): string {
  const timeOfDay = getTimeOfDay();

  return `Analyze the following voice biomarker data and generate personalized wellness insights.

VOICE ANALYSIS RESULTS:
- Stress Score: ${metrics.stress_score}/100
- Anxiety Score: ${metrics.anxiety_score}/100
- Depression Indicators: ${metrics.depression_score}/100
- Detected Emotion: ${metrics.emotion || "not determined"}
- Confidence: ${metrics.confidence ? Math.round(metrics.confidence * 100) + "%" : "N/A"}

VOCAL BIOMARKERS:
- Pitch Variability: ${metrics.pitch_variability} Hz (std deviation)
- Speech Rate: ${metrics.speech_rate} syllables/sec
- Vocal Energy (RMS): ${metrics.energy}
- Pause Ratio: ${Math.round(metrics.pause_ratio * 100)}% silence
- Jitter (voice tremor): ${metrics.jitter}

CONTEXT:
- Time of day: ${timeOfDay}
- ${metrics.stress_score > 60 ? "User appears to be under significant stress." : ""}
- ${metrics.depression_score > 50 ? "Voice shows low energy patterns." : ""}
- ${metrics.anxiety_score > 60 ? "Speech patterns suggest elevated anxiety." : ""}
- ${metrics.pause_ratio > 0.4 ? "Many pauses detected — possible hesitation or fatigue." : ""}
- ${metrics.pitch_variability < 15 ? "Monotone speech detected — possible flat affect." : ""}
- ${metrics.speech_rate > 5 ? "Rapid speech — possible nervousness." : ""}
- ${metrics.energy < 0.04 ? "Very low vocal energy — possible exhaustion." : ""}

Generate warm, supportive wellness insights in JSON format.`;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "late night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

// ─── Service ────────────────────────────────────────────────

export class WellnessInsightsService {
  /**
   * Generate personalized wellness insights from voice analysis metrics.
   * Uses OpenAI GPT-4o with clinical-safe prompt engineering.
   * Includes Redis caching to reduce API costs for similar inputs.
   */
  static async generateInsights(
    metrics: VoiceMetricsInput
  ): Promise<WellnessInsight> {
    // 1. Check cache for similar analysis
    const cacheKey = this.buildCacheKey(metrics);
    const cached = await this.getCachedInsight(cacheKey);
    if (cached) {
      logger.debug("Wellness insight served from cache");
      return cached;
    }

    // 2. Call OpenAI
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(metrics) },
        ],
        temperature: 0.6, // Balanced creativity + consistency
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        logger.warn("Empty OpenAI response for wellness insights");
        return this.getFallbackInsights(metrics);
      }

      // 3. Parse and validate
      const parsed = JSON.parse(content) as WellnessInsight;
      const validated = this.validateAndSanitize(parsed, metrics);

      // 4. Cache for 30 minutes
      await this.cacheInsight(cacheKey, validated);

      return validated;
    } catch (error: any) {
      logger.error("Wellness insights generation failed:", error.message);
      return this.getFallbackInsights(metrics);
    }
  }

  /**
   * Validate the AI response and ensure all fields exist.
   * Sanitize any potentially unsafe content.
   */
  private static validateAndSanitize(
    raw: any,
    metrics: VoiceMetricsInput
  ): WellnessInsight {
    return {
      emotional_summary:
        typeof raw.emotional_summary === "string"
          ? raw.emotional_summary.slice(0, 500)
          : this.getDefaultSummary(metrics),
      wellness_suggestions: Array.isArray(raw.wellness_suggestions)
        ? raw.wellness_suggestions.slice(0, 5).map((s: any) => String(s).slice(0, 200))
        : this.getDefaultSuggestions(metrics),
      calming_recommendations: Array.isArray(raw.calming_recommendations)
        ? raw.calming_recommendations.slice(0, 3).map((s: any) => String(s).slice(0, 200))
        : ["Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s", "Listen to calming nature sounds for 5 minutes"],
      hydration_reminder:
        typeof raw.hydration_reminder === "string"
          ? raw.hydration_reminder.slice(0, 200)
          : "Stay hydrated — aim for a glass of water in the next 30 minutes. Dehydration can amplify stress.",
      sleep_recommendation:
        typeof raw.sleep_recommendation === "string"
          ? raw.sleep_recommendation.slice(0, 200)
          : "Try to maintain a consistent bedtime tonight. Quality sleep is your body's best recovery tool.",
      overall_tone: ["positive", "neutral", "concerning"].includes(raw.overall_tone)
        ? raw.overall_tone
        : this.determineOverallTone(metrics),
      risk_level: ["low", "moderate", "high"].includes(raw.risk_level)
        ? raw.risk_level
        : this.determineRiskLevel(metrics),
      encouragement:
        typeof raw.encouragement === "string"
          ? raw.encouragement.slice(0, 300)
          : "Remember: checking in with yourself is an act of courage. You're doing great by being mindful of your wellbeing.",
    };
  }

  // ─── Fallback System ────────────────────────────────────

  /**
   * Rule-based fallback when OpenAI is unavailable.
   * Generates insights purely from score thresholds.
   */
  static getFallbackInsights(metrics: VoiceMetricsInput): WellnessInsight {
    const tone = this.determineOverallTone(metrics);
    const risk = this.determineRiskLevel(metrics);

    return {
      emotional_summary: this.getDefaultSummary(metrics),
      wellness_suggestions: this.getDefaultSuggestions(metrics),
      calming_recommendations: this.getDefaultCalming(metrics),
      hydration_reminder: this.getHydrationReminder(metrics),
      sleep_recommendation: this.getSleepRecommendation(metrics),
      overall_tone: tone,
      risk_level: risk,
      encouragement: this.getEncouragement(tone),
    };
  }

  private static getDefaultSummary(metrics: VoiceMetricsInput): string {
    const { stress_score, anxiety_score, depression_score } = metrics;

    if (stress_score > 70 && anxiety_score > 60) {
      return "Your voice patterns suggest you may be carrying a lot right now. Both stress and anxiety indicators are elevated. This is your body's way of signaling it needs care. You're not alone in feeling this way.";
    }
    if (depression_score > 60) {
      return "Your vocal energy seems lower than usual today. This could indicate fatigue or emotional heaviness. It's okay to have days like this — what matters is that you're checking in with yourself.";
    }
    if (stress_score > 50) {
      return "You appear to be experiencing moderate stress today. Your voice shows some tension patterns, but also signs of resilience. Consider taking small breaks to reset your nervous system.";
    }
    if (anxiety_score > 50) {
      return "Your speech patterns suggest some restlessness or nervousness. This is a normal human response, and there are simple techniques that can help you feel more grounded.";
    }
    return "Your voice patterns suggest a relatively stable emotional state today. Your pitch variability and speech rhythm indicate you're in a balanced place. Keep nurturing this equilibrium.";
  }

  private static getDefaultSuggestions(metrics: VoiceMetricsInput): string[] {
    const suggestions: string[] = [];

    if (metrics.stress_score > 50) {
      suggestions.push("Take a 5-minute walking break to physically release tension from your body.");
      suggestions.push("Try progressive muscle relaxation — tense and release each muscle group for 5 seconds.");
    }
    if (metrics.anxiety_score > 50) {
      suggestions.push("Ground yourself with the 5-4-3-2-1 technique: notice 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.");
      suggestions.push("Write down your current worries on paper — externalizing thoughts reduces their power.");
    }
    if (metrics.depression_score > 50) {
      suggestions.push("Reach out to someone you trust today, even with a simple text. Connection is healing.");
      suggestions.push("Step outside for 10 minutes of natural light — sunlight helps regulate mood hormones.");
    }
    if (metrics.energy < 0.04) {
      suggestions.push("Your energy seems low. A brief stretch or cold water on your wrists can help revitalize.");
    }
    if (suggestions.length === 0) {
      suggestions.push("Continue your current routine — your voice shows good emotional balance.");
      suggestions.push("Consider journaling what went well today to reinforce positive patterns.");
      suggestions.push("A short mindfulness session can help maintain your current equilibrium.");
    }

    return suggestions.slice(0, 4);
  }

  private static getDefaultCalming(metrics: VoiceMetricsInput): string[] {
    if (metrics.anxiety_score > 60) {
      return [
        "Box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 4 cycles.",
        "Place your hand on your chest and feel your heartbeat slow down with each breath.",
        "Hum softly for 30 seconds — vagus nerve stimulation naturally calms the nervous system.",
      ];
    }
    if (metrics.stress_score > 60) {
      return [
        "4-7-8 breathing: inhale through nose for 4s, hold for 7s, exhale through mouth for 8s.",
        "Visualize a peaceful place — a beach, forest, or anywhere you feel safe and calm.",
      ];
    }
    return [
      "Try 3 minutes of mindful breathing — just observe your breath without changing it.",
      "Listen to calming instrumental music or nature sounds for 5 minutes.",
    ];
  }

  private static getHydrationReminder(metrics: VoiceMetricsInput): string {
    if (metrics.stress_score > 60) {
      return "Stress depletes your body faster. Drink a full glass of water now — dehydration worsens anxiety and fatigue by up to 25%.";
    }
    if (metrics.energy < 0.04) {
      return "Low vocal energy can signal dehydration. Try warm water with lemon — it's gentle on your system and helps restore alertness.";
    }
    return "Stay ahead of thirst today. Aim for 8 glasses of water — your voice (and mind) will thank you.";
  }

  private static getSleepRecommendation(metrics: VoiceMetricsInput): string {
    if (metrics.depression_score > 60 || metrics.energy < 0.04) {
      return "Your voice suggests fatigue. Tonight, try to be in bed 30 minutes earlier. Avoid screens for 1 hour before sleep, and consider a warm bath to signal your body it's time to rest.";
    }
    if (metrics.stress_score > 60) {
      return "High stress can disrupt sleep. Try a body scan meditation before bed — start at your toes and slowly relax each area. Keep your room cool (65-68°F) for optimal sleep.";
    }
    if (metrics.anxiety_score > 60) {
      return "Racing thoughts at bedtime? Write tomorrow's to-do list before bed to externalize worries. Try the 'cognitive shuffle' — think of random unrelated words to distract your mind from anxious loops.";
    }
    return "Maintain your sleep routine — consistency is the #1 factor for restorative rest. Your current patterns suggest good recovery.";
  }

  private static getEncouragement(tone: string): string {
    if (tone === "concerning") {
      return "You took a brave step by checking in with yourself today. Remember: difficult moments are temporary. If you're struggling, reaching out to a professional is a sign of strength, not weakness. You deserve support.";
    }
    if (tone === "neutral") {
      return "You're showing up for yourself, and that matters. Every check-in is a small investment in your wellbeing. Keep going — you're building self-awareness that pays dividends over time.";
    }
    return "You're in a good place today — celebrate that! Your voice reflects resilience and balance. Keep nurturing the habits that got you here.";
  }

  // ─── Scoring Helpers ────────────────────────────────────

  private static determineOverallTone(
    metrics: VoiceMetricsInput
  ): "positive" | "neutral" | "concerning" {
    const avg = (metrics.stress_score + metrics.anxiety_score + metrics.depression_score) / 3;
    if (avg > 60) return "concerning";
    if (avg > 35) return "neutral";
    return "positive";
  }

  private static determineRiskLevel(
    metrics: VoiceMetricsInput
  ): "low" | "moderate" | "high" {
    const max = Math.max(metrics.stress_score, metrics.anxiety_score, metrics.depression_score);
    if (max > 75) return "high";
    if (max > 45) return "moderate";
    return "low";
  }

  // ─── Caching ────────────────────────────────────────────

  /**
   * Build a cache key from rounded score buckets (reduces unique keys).
   * Scores are bucketed into groups of 10 to maximize cache hits.
   */
  private static buildCacheKey(metrics: VoiceMetricsInput): string {
    const bucket = (n: number) => Math.round(n / 10) * 10;
    const input = `${bucket(metrics.stress_score)}-${bucket(metrics.anxiety_score)}-${bucket(metrics.depression_score)}-${getTimeOfDay()}`;
    return `wellness:${crypto.createHash("md5").update(input).digest("hex").slice(0, 12)}`;
  }

  private static async getCachedInsight(key: string): Promise<WellnessInsight | null> {
    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch {
      // Cache miss is non-fatal
    }
    return null;
  }

  private static async cacheInsight(key: string, insight: WellnessInsight): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(insight), 1800); // 30 min TTL
    } catch {
      // Cache write failure is non-fatal
    }
  }
}
