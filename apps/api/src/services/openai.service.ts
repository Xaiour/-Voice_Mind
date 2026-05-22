import { openai, OPENAI_MODEL } from "../config/openai";
import { logger } from "../utils/logger";
import { redis } from "../config/redis";
import crypto from "crypto";

interface AnalysisInput {
  transcript: string;
  emotions: {
    primary: string;
    confidence: number;
    distribution: Record<string, number>;
  };
  voiceMetrics: {
    pitch: { mean: number; min: number; max: number; std: number };
    energy: { mean: number; max: number };
    speakingRate: number;
  };
}

interface AnalysisInsights {
  sentimentScore: number;
  summary: string;
  clinicalObservations: string[];
  riskIndicators: string[];
  recommendations: string[];
  emotionalState: string;
  confidenceLevel: number;
}

interface ChatInput {
  message: string;
  conversationHistory: { role: "user" | "assistant" | "system"; content: string }[];
  emotionalContext?: string;
}

export class OpenAIService {
  /**
   * Generate clinical insights from voice analysis data.
   */
  static async generateAnalysisInsights(
    input: AnalysisInput
  ): Promise<AnalysisInsights> {
    const systemPrompt = `You are a clinical voice analysis AI assistant specialized in mental health assessment. 
You analyze voice recordings to identify emotional patterns and provide therapeutic insights.

IMPORTANT:
- Provide evidence-based observations only
- Flag risk indicators clearly but avoid alarmist language
- Recommendations should be actionable and professional
- Always note your confidence level
- You are an assistive tool, NOT a replacement for professional diagnosis

Respond ONLY in valid JSON format matching this schema:
{
  "sentimentScore": <number 1-10>,
  "summary": "<2-3 sentence overview>",
  "clinicalObservations": ["<observation1>", "<observation2>"],
  "riskIndicators": ["<indicator1>"] or [],
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "emotionalState": "<primary emotional state description>",
  "confidenceLevel": <number 0-1>
}`;

    const userPrompt = `Analyze this voice session data:

TRANSCRIPT:
${input.transcript || "No transcript available"}

DETECTED EMOTIONS:
- Primary: ${input.emotions.primary} (confidence: ${input.emotions.confidence})
- Distribution: ${JSON.stringify(input.emotions.distribution)}

VOICE METRICS:
- Pitch: mean=${input.voiceMetrics.pitch.mean}Hz, std=${input.voiceMetrics.pitch.std}
- Energy: mean=${input.voiceMetrics.energy.mean}, max=${input.voiceMetrics.energy.max}
- Speaking Rate: ${input.voiceMetrics.speakingRate} words/min

Provide your clinical analysis in JSON format.`;

    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Low temp for consistent clinical output
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return JSON.parse(content) as AnalysisInsights;
    } catch (error: any) {
      logger.error("OpenAI analysis error:", error.message);
      // Return default response on failure
      return {
        sentimentScore: 5,
        summary: "Analysis could not be completed. Please try again.",
        clinicalObservations: ["Unable to generate observations at this time."],
        riskIndicators: [],
        recommendations: ["Please retry the analysis or consult manually."],
        emotionalState: "undetermined",
        confidenceLevel: 0,
      };
    }
  }

  /**
   * AI Chat — conversational assistant for therapists.
   */
  static async chat(input: ChatInput): Promise<{
    reply: string;
    tokensUsed: number;
  }> {
    const systemPrompt = `You are VoiceMind AI, a warm and supportive mental wellness companion.
You help users understand their emotional patterns from voice analysis, suggest daily habits, 
breathing exercises, mindfulness techniques, and actionable wellness practices.

STRICT GUARDRAILS:
- ONLY discuss mental health, wellness, emotions, self-care, habits, exercises, and this app
- If asked about anything unrelated (coding, politics, math, etc.), politely redirect: "I'm here to support your mental wellness. Let's talk about how you're feeling or explore some helpful exercises."
- NEVER provide medical diagnoses or prescribe medication
- For crisis situations, always say: "If you're in crisis, please contact 988 Suicide & Crisis Lifeline or your local emergency services."
- You are NOT a therapist — you are a supportive AI wellness tool

WHAT YOU CAN DO:
- Suggest breathing exercises (box breathing, 4-7-8, diaphragmatic)
- Recommend daily habits (journaling, gratitude, sleep hygiene, hydration, walks)
- Explain what the user's voice analysis results mean in simple terms
- Offer grounding techniques (5-4-3-2-1 method, body scans)
- Suggest physical activities (yoga, stretching, walking)
- Provide motivational support and positive affirmations
- Help users build a consistent self-care routine

TONE: Friendly, gentle, encouraging. Like a kind friend who cares about your wellbeing.

${input.emotionalContext ? `The user's latest voice analysis detected: ${input.emotionalContext}. Use this context to personalize your suggestions.` : ""}`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...input.conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user" as const, content: input.message },
    ];

    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      });

      const reply = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      const tokensUsed = response.usage?.total_tokens || 0;

      return { reply, tokensUsed };
    } catch (error: any) {
      logger.error("OpenAI chat error:", error.message);
      return {
        reply: "I'm experiencing a temporary issue. Please try again in a moment.",
        tokensUsed: 0,
      };
    }
  }
}
