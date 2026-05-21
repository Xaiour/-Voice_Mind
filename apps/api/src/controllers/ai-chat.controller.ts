import { Request, Response } from "express";
import { AiChatService } from "../services/ai-chat.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

/**
 * AI Chat Controller — handles conversational AI interactions.
 */
export class AiChatController {
  /**
   * POST /api/ai/chat
   * Send a message and get AI response.
   */
  static chat = asyncHandler(async (req: Request, res: Response) => {
    const { message, conversationId } = req.body;

    if (!message || message.trim().length === 0) {
      throw ApiError.badRequest("Message is required.");
    }

    const result = await AiChatService.sendMessage(
      req.userId!,
      message,
      conversationId
    );

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        conversationId: result.conversationId,
      },
    });
  });

  /**
   * GET /api/ai/conversations
   * Get user's conversation list.
   */
  static getConversations = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await AiChatService.getConversations(req.userId!, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/ai/conversations/:conversationId
   * Get single conversation messages.
   */
  static getConversation = asyncHandler(async (req: Request, res: Response) => {
    const conversation = await AiChatService.getConversation(
      req.params.conversationId,
      req.userId!
    );

    if (!conversation) {
      throw ApiError.notFound("Conversation not found.");
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  });

  /**
   * DELETE /api/ai/conversations/:conversationId
   * Delete a conversation.
   */
  static deleteConversation = asyncHandler(async (req: Request, res: Response) => {
    await AiChatService.deleteConversation(
      req.params.conversationId,
      req.userId!
    );

    res.status(200).json({
      success: true,
      message: "Conversation deleted.",
    });
  });
}
