import { Router, Request, Response } from "express";
import { AiChatController } from "../controllers/ai-chat.controller";
import { authenticate } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { z } from "zod";
import { openai, OPENAI_MODEL } from "../config/openai";
import { env } from "../config/env";

const router = Router();

// ─── Health Check (no auth required) ────────────────────────
router.get("/health", async (_req: Request, res: Response) => {
  const provider = env.AI_PROVIDER || "gemini";
  const apiKey = provider === "gemini" ? env.GEMINI_API_KEY : env.OPENAI_API_KEY;

  const status: Record<string, any> = {
    provider,
    keyConfigured: !!apiKey,
    keyPrefix: apiKey ? apiKey.slice(0, 8) + "..." : "NOT SET",
    model: OPENAI_MODEL,
    reachable: false,
    error: null,
  };

  if (!apiKey) {
    status.error = provider === "gemini"
      ? "GEMINI_API_KEY is not set. Get free key at https://aistudio.google.com/app/apikey"
      : "OPENAI_API_KEY is not set";
    return res.status(503).json({ success: false, ...status });
  }

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: "Say OK" }],
      max_tokens: 5,
    });
    status.reachable = true;
    status.testResponse = response.choices[0]?.message?.content;
    status.tokensUsed = response.usage?.total_tokens;
    return res.status(200).json({ success: true, ...status });
  } catch (error: any) {
    status.error = error?.message || "Unknown error";
    status.statusCode = error?.status || null;
    const httpStatus = error?.status === 401 ? 401 : error?.status === 429 ? 429 : 503;
    return res.status(httpStatus).json({ success: false, ...status });
  }
});

// All other AI routes are protected
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────
const chatSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
  conversationId: z.string().optional(),
});

// ─── Routes ─────────────────────────────────────────────────

// Send chat message (rate limited: 30 messages per 15 min)
router.post(
  "/chat",
  rateLimiter(30, 900),
  validate({ body: chatSchema }),
  AiChatController.chat
);

// List conversations
router.get("/conversations", AiChatController.getConversations);

// Get single conversation
router.get("/conversations/:conversationId", AiChatController.getConversation);

// Delete conversation
router.delete("/conversations/:conversationId", AiChatController.deleteConversation);

export default router;
