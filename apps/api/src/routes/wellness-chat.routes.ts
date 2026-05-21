import { Router } from "express";
import { WellnessChatController } from "../controllers/wellness-chat.controller";
import { authenticate } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimiter";

const router = Router();

// All wellness chat routes are protected
router.use(authenticate);

// ─── Routes ─────────────────────────────────────────────────

// Send a message (rate limited: 40 messages per 15 min)
router.post("/chat", rateLimiter(40, 900), WellnessChatController.sendMessage);

// Get conversation history for a session
router.get("/chat/history/:sessionId", WellnessChatController.getHistory);

// List active sessions
router.get("/chat/sessions", WellnessChatController.listSessions);

// End a session
router.delete("/chat/:sessionId", WellnessChatController.endSession);

export default router;
