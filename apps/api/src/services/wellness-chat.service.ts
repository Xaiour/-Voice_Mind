import { openai, OPENAI_MODEL } from "../config/openai";
import { redis } from "../config/redis";
import { logger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid";

// ─── Types ──────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface SessionContext {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  emotionalContext?: {
    lastStressScore?: number;
    lastAnxietyScore?: number;
    lastDepressionScore?: number;
    lastEmotion?: string;
    lastCheckIn?: string;
  };
  createdAt: number;
  lastActivity: number;
}

interface ChatResponse {
  reply: string;
  sessionId: string;
  messageCount: number;
  sessionExpiresIn: number; // seconds remaining
}

// ─── Constants ──────────────────────────────────────────────

const SESSION_TTL = 3600; // 1 hour auto-expire
const MAX_CONTEXT_MESSAGES = 20; // Keep last 20 messages for context
const SESSION_KEY_PREFIX = "wellness_chat:";

// ─── System Prompt ──────────────────────────────────────────

const SYSTEM_PROMPT = `You are VoiceMind Companion — a warm, emotionally intelligent wellness assistant embedded in a voice biomarker analysis app.

PERSONALITY:
- You are calm, patient, and deeply empathetic
- You respond like a caring friend who also understands wellness science
- You use gentle language and validate emotions before offering suggestions
- You're curious about how the user is feeling and ask thoughtful follow-ups
- You speak in short, digestible paragraphs (2-3 sentences max per paragraph)

CONVERSATIONAL STYLE:
- Always acknowledge the user's emotion first ("That sounds really tough...")
- Ask open-ended questions to understand deeper ("What does that feel like for you?")
- Offer one actionable micro-suggestion per response (not overwhelming lists)
- Use calming language: "notice", "gently", "whenever you're ready", "it's okay"
- Mirror the user's energy — if they're low-energy, be soft; if they're anxious, be grounding

WHAT YOU CAN DO:
- Provide emotional support and validation
- Suggest evidence-based coping techniques (breathing, grounding, journaling)
- Help users process their voice analysis results in a supportive way
- Offer gentle psychoeducation about stress, anxiety, and emotional health
- Encourage self-compassion and professional support when needed

WHAT YOU MUST NEVER DO:
- Diagnose any condition (never say "you have depression/anxiety")
- Provide medical advice or suggest medications
- Minimize or dismiss feelings ("just think positive", "others have it worse")
- Promise outcomes ("this will cure your anxiety")
- Share personal opinions on politics, religion, or controversial topics
- Continue conversation if user expresses active self-harm intent (instead: provide 988 Lifeline number and encourage immediate professional help)

CRISIS PROTOCOL:
If a user expresses thoughts of self-harm or suicide, respond ONLY with:
"I hear you, and I want you to know you matter. Please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or go to your nearest emergency room. You deserve immediate support from someone trained to help."

CONTEXT AWARENESS:
- If emotional scores are provided in context, reference them gently
- Remember earlier parts of the conversation and build on them
- If the user seems to be improving during the chat, acknowledge it warmly

Keep responses under 150 words unless the user asks for more detail.`;

// ─── Service ────────────────────────────────────────────────

export class WellnessChatService {
  /**
   * Send a message to the wellness chat assistant.
   * Maintains conversation context in Redis with auto-expiry.
   */
  static async chat(
    userId: string,
    message: string,
    sessionId?: string,
    emotionalContext?: SessionContext["emotionalContext"]
  ): Promise<ChatResponse> {
    // 1. Get or create session
    let session = sessionId
      ? await this.getSession(userId, sessionId)
      : null;

    if (!session) {
      session = this.createNewSession(userId);
    }

    // 2. Update emotional context if provided
    if (emotionalContext) {
      session.emotionalContext = {
        ...session.emotionalContext,
        ...emotionalContext,
      };
    }

    // 3. Add user message
    session.messages.push({
      role: "user",
      content: message,
      timestamp: Date.now(),
    });

    // 4. Build messages array for OpenAI
    const openaiMessages = this.buildOpenAIMessages(session);

    // 5. Call OpenAI
    let reply: string;
    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: openaiMessages,
        temperature: 0.75, // Slightly creative for natural conversation
        max_tokens: 300,
        presence_penalty: 0.3, // Encourage diverse responses
        frequency_penalty: 0.2, // Reduce repetition
      });

      reply =
        response.choices[0]?.message?.content ||
        "I'm here with you. Could you tell me a bit more about how you're feeling?";
    } catch (error: any) {
      logger.error("Wellness chat OpenAI error:", error.message);
      reply = this.getFallbackResponse(message, session);
    }

    // 6. Add assistant reply to session
    session.messages.push({
      role: "assistant",
      content: reply,
      timestamp: Date.now(),
    });

    // 7. Trim context if too long
    if (session.messages.length > MAX_CONTEXT_MESSAGES) {
      // Keep system context summary + last N messages
      session.messages = session.messages.slice(-MAX_CONTEXT_MESSAGES);
    }

    // 8. Update last activity and save to Redis
    session.lastActivity = Date.now();
    await this.saveSession(session);

    // 9. Return response
    return {
      reply,
      sessionId: session.sessionId,
      messageCount: session.messages.length,
      sessionExpiresIn: SESSION_TTL,
    };
  }

  /**
   * Get conversation history for a session.
   */
  static async getHistory(
    userId: string,
    sessionId: string
  ): Promise<ChatMessage[] | null> {
    const session = await this.getSession(userId, sessionId);
    if (!session) return null;
    return session.messages.filter((m) => m.role !== "system");
  }

  /**
   * List active chat sessions for a user.
   */
  static async listSessions(userId: string): Promise<
    { sessionId: string; messageCount: number; lastActivity: number }[]
  > {
    // Note: In production, use Redis SCAN with pattern matching
    // For now, we store a session index per user
    const indexKey = `${SESSION_KEY_PREFIX}index:${userId}`;
    const indexRaw = await redis.get(indexKey);
    if (!indexRaw) return [];

    try {
      const sessionIds: string[] = JSON.parse(indexRaw);
      const sessions = await Promise.all(
        sessionIds.map(async (sid) => {
          const session = await this.getSession(userId, sid);
          if (!session) return null;
          return {
            sessionId: sid,
            messageCount: session.messages.length,
            lastActivity: session.lastActivity,
          };
        })
      );
      return sessions.filter(Boolean) as any[];
    } catch {
      return [];
    }
  }

  /**
   * End a chat session (delete from Redis).
   */
  static async endSession(userId: string, sessionId: string): Promise<void> {
    const key = `${SESSION_KEY_PREFIX}${userId}:${sessionId}`;
    await redis.del(key);

    // Remove from index
    const indexKey = `${SESSION_KEY_PREFIX}index:${userId}`;
    const indexRaw = await redis.get(indexKey);
    if (indexRaw) {
      try {
        const sessionIds: string[] = JSON.parse(indexRaw);
        const updated = sessionIds.filter((id) => id !== sessionId);
        await redis.set(indexKey, JSON.stringify(updated), SESSION_TTL * 24); // Index lives longer
      } catch {}
    }
  }

  // ─── Private Methods ────────────────────────────────────

  private static createNewSession(userId: string): SessionContext {
    return {
      sessionId: uuidv4(),
      userId,
      messages: [],
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
  }

  private static async getSession(
    userId: string,
    sessionId: string
  ): Promise<SessionContext | null> {
    const key = `${SESSION_KEY_PREFIX}${userId}:${sessionId}`;
    const raw = await redis.get(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as SessionContext;
    } catch {
      return null;
    }
  }

  private static async saveSession(session: SessionContext): Promise<void> {
    const key = `${SESSION_KEY_PREFIX}${session.userId}:${session.sessionId}`;
    await redis.set(key, JSON.stringify(session), SESSION_TTL);

    // Update session index for the user
    const indexKey = `${SESSION_KEY_PREFIX}index:${session.userId}`;
    const indexRaw = await redis.get(indexKey);
    let sessionIds: string[] = [];

    if (indexRaw) {
      try {
        sessionIds = JSON.parse(indexRaw);
      } catch {}
    }

    if (!sessionIds.includes(session.sessionId)) {
      sessionIds.push(session.sessionId);
    }

    // Keep only last 10 sessions in index
    if (sessionIds.length > 10) {
      sessionIds = sessionIds.slice(-10);
    }

    await redis.set(indexKey, JSON.stringify(sessionIds), SESSION_TTL * 24);
  }

  /**
   * Build the messages array for OpenAI, including system prompt,
   * emotional context, and conversation history.
   */
  private static buildOpenAIMessages(
    session: SessionContext
  ): { role: "system" | "user" | "assistant"; content: string }[] {
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [];

    // System prompt
    let systemContent = SYSTEM_PROMPT;

    // Inject emotional context if available
    if (session.emotionalContext) {
      const ctx = session.emotionalContext;
      systemContent += `\n\nCURRENT USER CONTEXT:`;
      if (ctx.lastStressScore !== undefined) {
        systemContent += `\n- Last stress score: ${ctx.lastStressScore}/100`;
      }
      if (ctx.lastAnxietyScore !== undefined) {
        systemContent += `\n- Last anxiety score: ${ctx.lastAnxietyScore}/100`;
      }
      if (ctx.lastDepressionScore !== undefined) {
        systemContent += `\n- Last depression score: ${ctx.lastDepressionScore}/100`;
      }
      if (ctx.lastEmotion) {
        systemContent += `\n- Detected emotion: ${ctx.lastEmotion}`;
      }
      if (ctx.lastCheckIn) {
        systemContent += `\n- Last check-in: ${ctx.lastCheckIn}`;
      }
      systemContent += `\nUse this context subtly — don't list numbers back to the user unless they ask. Instead, let it inform your tone and suggestions.`;
    }

    messages.push({ role: "system", content: systemContent });

    // Add conversation history (last N messages)
    const history = session.messages.slice(-MAX_CONTEXT_MESSAGES);
    for (const msg of history) {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    return messages;
  }

  /**
   * Rule-based fallback when OpenAI is unavailable.
   * Returns contextually appropriate responses based on keywords.
   */
  private static getFallbackResponse(
    message: string,
    session: SessionContext
  ): string {
    const lower = message.toLowerCase();

    // Crisis detection
    if (
      lower.includes("kill myself") ||
      lower.includes("suicide") ||
      lower.includes("end my life") ||
      lower.includes("want to die")
    ) {
      return "I hear you, and I want you to know you matter. Please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or go to your nearest emergency room. You deserve immediate support from someone trained to help.";
    }

    // Greeting
    if (
      lower.includes("hi") ||
      lower.includes("hello") ||
      lower.includes("hey")
    ) {
      return "Hey there. I'm glad you're here. How are you feeling right now? Take your time — there's no rush.";
    }

    // Stress keywords
    if (
      lower.includes("stress") ||
      lower.includes("overwhelm") ||
      lower.includes("pressure")
    ) {
      return "That sounds like a lot to carry. Stress has a way of building up quietly. Would you like to try a quick grounding exercise together, or would it help more to just talk through what's on your mind?";
    }

    // Anxiety keywords
    if (
      lower.includes("anxious") ||
      lower.includes("anxiety") ||
      lower.includes("worried") ||
      lower.includes("nervous")
    ) {
      return "Anxiety can feel so overwhelming, especially when it shows up in your body. Right now, try placing your feet flat on the floor and taking one slow breath. I'm here with you. What's weighing on you most?";
    }

    // Sadness keywords
    if (
      lower.includes("sad") ||
      lower.includes("down") ||
      lower.includes("depressed") ||
      lower.includes("hopeless")
    ) {
      return "I'm sorry you're feeling this way. It takes courage to acknowledge these feelings. You don't have to go through this alone. Would you like to explore what might be contributing to this heaviness?";
    }

    // Sleep
    if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("tired")) {
      return "Rest is so important for emotional recovery. When sleep doesn't come easily, it can make everything else feel harder. What does your evening routine look like? Sometimes small shifts can make a real difference.";
    }

    // Default — warm, open-ended
    if (session.messages.length <= 2) {
      return "Thank you for sharing that with me. I'd love to understand more about what you're experiencing. Could you tell me a little more about what's been on your mind lately?";
    }

    return "I hear you. Thank you for being open with me. What feels most important for you right now — would you like a suggestion for something calming, or would it help to keep talking through things?";
  }
}
