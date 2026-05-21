import { Request, Response } from "express";
import { WellnessChatService } from "../services/wellness-chat.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

/**
 * Wellness Chat Controller
 * Handles conversational AI wellness assistant interactions.
 */
export class WellnessChatController {
  /**
   * POST /api/wellness/chat
   * Send a message to the wellness chat assistant.
   */
  static sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { message, sessionId, emotionalContext } = req.body;

    if (!message || message.trim().length === 0) {
      throw ApiError.badRequest("Message is required.");
    }

    if (message.length > 2000) {
      throw ApiError.badRequest("Message too long. Maximum 2000 characters.");
    }

    const response = await WellnessChatService.chat(
      req.userId!,
      message.trim(),
      sessionId,
      emotionalContext
    );

    res.status(200).json({
      success: true,
      data: response,
    });
  });

  /**
   * GET /api/wellness/chat/history/:sessionId
   * Get conversation history for a session.
   */
  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    if (!sessionId) {
      throw ApiError.badRequest("Session ID is required.");
    }

    const messages = await WellnessChatService.getHistory(req.userId!, sessionId);

    if (!messages) {
      throw ApiError.notFound("Session not found or expired.");
    }

    res.status(200).json({
      success: true,
      data: { sessionId, messages },
    });
  });

  /**
   * GET /api/wellness/chat/sessions
   * List active chat sessions for the current user.
   */
  static listSessions = asyncHandler(async (req: Request, res: Response) => {
    const sessions = await WellnessChatService.listSessions(req.userId!);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  });

  /**
   * DELETE /api/wellness/chat/:sessionId
   * End a chat session.
   */
  static endSession = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    if (!sessionId) {
      throw ApiError.badRequest("Session ID is required.");
    }

    await WellnessChatService.endSession(req.userId!, sessionId);

    res.status(200).json({
      success: true,
      message: "Session ended.",
    });
  });
}
