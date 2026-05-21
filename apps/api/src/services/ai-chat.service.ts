import { v4 as uuidv4 } from "uuid";
import { AiChat, IAiChat } from "../models/AiChat";
import { VoiceAnalysis } from "../models/VoiceAnalysis";
import { OpenAIService } from "./openai.service";
import { ApiError } from "../utils/ApiError";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export class AiChatService {
  /**
   * Send a message and get AI response.
   */
  static async sendMessage(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<{ reply: string; conversationId: string }> {
    // Get or create conversation
    let chat: IAiChat | null = null;

    if (conversationId) {
      chat = await AiChat.findOne({ conversationId, userId, isActive: true });
    }

    if (!chat) {
      conversationId = uuidv4();
      chat = await AiChat.create({
        userId,
        conversationId,
        messages: [],
        totalTokensUsed: 0,
      });
    }

    // Add user message
    chat.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Get recent emotional context
    const recentAnalysis = await VoiceAnalysis.findOne({
      userId,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .lean();

    const emotionalContext = recentAnalysis?.aiInsights?.emotionalState || undefined;

    // Get AI response
    const conversationHistory = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const { reply, tokensUsed } = await OpenAIService.chat({
      message,
      conversationHistory,
      emotionalContext,
    });

    // Add assistant message
    chat.messages.push({
      role: "assistant",
      content: reply,
      timestamp: new Date(),
    });

    // Update metadata
    chat.totalTokensUsed += tokensUsed;

    // Auto-generate title from first message
    if (!chat.title && chat.messages.length <= 2) {
      chat.title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
    }

    await chat.save();

    return { reply, conversationId: conversationId! };
  }

  /**
   * Get conversation history for a user.
   */
  static async getConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      AiChat.find({ userId, isActive: true })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("conversationId title messages updatedAt totalTokensUsed")
        .lean(),
      AiChat.countDocuments({ userId, isActive: true }),
    ]);

    // Return with last message preview
    const data = conversations.map((c) => ({
      conversationId: c.conversationId,
      title: c.title,
      lastMessage: c.messages[c.messages.length - 1]?.content?.slice(0, 100),
      messageCount: c.messages.length,
      updatedAt: c.updatedAt,
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single conversation messages.
   */
  static async getConversation(
    conversationId: string,
    userId: string
  ): Promise<IAiChat | null> {
    return AiChat.findOne({ conversationId, userId });
  }

  /**
   * Delete (soft-delete) a conversation.
   */
  static async deleteConversation(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const result = await AiChat.findOneAndUpdate(
      { conversationId, userId },
      { isActive: false }
    );
    if (!result) {
      throw ApiError.notFound("Conversation not found.");
    }
  }
}
