import { WellnessInsight } from "../services/wellness-insights.service";

/**
 * Wellness Response Formatter
 * Transforms raw AI insights into various output formats
 * for different client needs (full, summary, notification, voice).
 */

// ─── Output Formats ─────────────────────────────────────────

export interface FormattedInsightFull {
  message: string;
  sections: {
    summary: string;
    suggestions: string[];
    calming: string[];
    hydration: string;
    sleep: string;
    encouragement: string;
  };
  metadata: {
    tone: string;
    risk_level: string;
    generated_at: string;
    disclaimer: string;
  };
}

export interface FormattedInsightSummary {
  one_liner: string;
  top_action: string;
  tone_emoji: string;
  risk_badge: string;
}

export interface FormattedInsightNotification {
  title: string;
  body: string;
  priority: "low" | "default" | "high";
}

export interface FormattedInsightVoice {
  spoken_text: string;
  duration_estimate_seconds: number;
}

// ─── Formatter Class ────────────────────────────────────────

export class WellnessFormatter {
  /**
   * Full formatted response — used by the dashboard UI.
   */
  static toFull(insight: WellnessInsight): FormattedInsightFull {
    return {
      message: this.buildCompositeMessage(insight),
      sections: {
        summary: insight.emotional_summary,
        suggestions: insight.wellness_suggestions,
        calming: insight.calming_recommendations,
        hydration: insight.hydration_reminder,
        sleep: insight.sleep_recommendation,
        encouragement: insight.encouragement,
      },
      metadata: {
        tone: insight.overall_tone,
        risk_level: insight.risk_level,
        generated_at: new Date().toISOString(),
        disclaimer:
          "This is not a medical diagnosis. If you are struggling, please reach out to a mental health professional or call 988 (Suicide & Crisis Lifeline).",
      },
    };
  }

  /**
   * Summary format — compact, for cards/widgets.
   */
  static toSummary(insight: WellnessInsight): FormattedInsightSummary {
    return {
      one_liner: this.extractOneLiner(insight.emotional_summary),
      top_action: insight.wellness_suggestions[0] || "Take a moment to breathe deeply.",
      tone_emoji: this.getToneEmoji(insight.overall_tone),
      risk_badge: this.getRiskBadge(insight.risk_level),
    };
  }

  /**
   * Notification format — for push notifications / in-app alerts.
   */
  static toNotification(insight: WellnessInsight): FormattedInsightNotification {
    const titles: Record<string, string> = {
      positive: "Looking good today!",
      neutral: "Check-in complete",
      concerning: "We noticed something",
    };

    const priority: Record<string, "low" | "default" | "high"> = {
      low: "low",
      moderate: "default",
      high: "high",
    };

    return {
      title: titles[insight.overall_tone] || "Wellness Update",
      body: this.extractOneLiner(insight.emotional_summary),
      priority: priority[insight.risk_level] || "default",
    };
  }

  /**
   * Voice format — optimized for text-to-speech readback.
   * Removes visual formatting, keeps it conversational.
   */
  static toVoice(insight: WellnessInsight): FormattedInsightVoice {
    const parts = [
      insight.emotional_summary,
      `Here's my top suggestion: ${insight.wellness_suggestions[0] || "Take a mindful pause."}`,
      insight.hydration_reminder,
      insight.encouragement,
    ];

    const spoken = parts.join(" ... ");
    // Rough estimate: ~150 words per minute for natural speech
    const wordCount = spoken.split(/\s+/).length;
    const durationEstimate = Math.ceil((wordCount / 150) * 60);

    return {
      spoken_text: spoken,
      duration_estimate_seconds: durationEstimate,
    };
  }

  // ─── Helpers ────────────────────────────────────────────

  /**
   * Build a single composite message combining key insight sections.
   * Used as the "main" response text in the full format.
   */
  private static buildCompositeMessage(insight: WellnessInsight): string {
    const parts: string[] = [];

    parts.push(insight.emotional_summary);

    if (insight.wellness_suggestions.length > 0) {
      parts.push(`Consider: ${insight.wellness_suggestions[0]}`);
    }

    if (insight.risk_level === "high") {
      parts.push(
        "If you're feeling overwhelmed, please don't hesitate to reach out to someone you trust or a professional."
      );
    }

    parts.push(insight.encouragement);

    return parts.join(" ");
  }

  /**
   * Extract the first sentence from a longer summary.
   */
  private static extractOneLiner(summary: string): string {
    const firstSentence = summary.split(/[.!?]/)[0];
    return firstSentence ? firstSentence.trim() + "." : summary.slice(0, 100);
  }

  /**
   * Map tone to a calming emoji indicator.
   */
  private static getToneEmoji(tone: string): string {
    const map: Record<string, string> = {
      positive: "sunshine",
      neutral: "balanced",
      concerning: "needs-care",
    };
    return map[tone] || "balanced";
  }

  /**
   * Map risk level to a badge label.
   */
  private static getRiskBadge(level: string): string {
    const map: Record<string, string> = {
      low: "all-clear",
      moderate: "monitor",
      high: "attention-needed",
    };
    return map[level] || "monitor";
  }
}

// ─── Fallback Message Templates ─────────────────────────────

/**
 * Pre-written fallback messages for when both OpenAI AND the rule-based
 * system somehow fail. These are hardcoded safety nets.
 */
export const FALLBACK_MESSAGES = {
  generic: {
    summary: "Thank you for checking in. Taking a moment to reflect on how you feel is already a positive step.",
    suggestion: "Try taking three deep breaths right now — in through your nose, out through your mouth.",
    encouragement: "You're showing up for yourself, and that matters more than you know.",
    hydration: "A glass of water can do wonders. Stay hydrated today.",
    sleep: "Prioritize rest tonight. Your body and mind will thank you tomorrow.",
  },
  error: {
    summary: "We weren't able to generate personalized insights right now, but we still care about your wellbeing.",
    suggestion: "Take a 5-minute break and do something that brings you calm.",
    encouragement: "Technical hiccups happen. What doesn't change is that you matter, and your wellbeing matters.",
  },
} as const;

/**
 * Get a complete safe fallback response that can be returned
 * even if all services are down.
 */
export function getEmergencyFallback(): WellnessInsight {
  return {
    emotional_summary: FALLBACK_MESSAGES.generic.summary,
    wellness_suggestions: [
      FALLBACK_MESSAGES.generic.suggestion,
      "Step outside for a moment of fresh air if you can.",
      "Write down one thing you're grateful for today.",
    ],
    calming_recommendations: [
      "4-7-8 breathing: inhale 4 seconds, hold 7, exhale 8. Repeat 3 times.",
      "Place both feet flat on the floor and notice the sensation of being grounded.",
    ],
    hydration_reminder: FALLBACK_MESSAGES.generic.hydration,
    sleep_recommendation: FALLBACK_MESSAGES.generic.sleep,
    overall_tone: "neutral",
    risk_level: "low",
    encouragement: FALLBACK_MESSAGES.generic.encouragement,
  };
}
