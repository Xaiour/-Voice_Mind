import { Router } from "express";
import { AiChatController } from "../controllers/ai-chat.controller";
import { authenticate } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validate";
import { z } from "zod";

const router = Router();

// All AI routes are protected
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
