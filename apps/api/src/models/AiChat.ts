import mongoose, { Schema, Document } from "mongoose";

// ─── Interface ──────────────────────────────────────────────
export interface IAiChat extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  conversationId: string; // Groups messages in a conversation

  messages: {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
  }[];

  // Context provided to AI
  context?: {
    recentAnalysisIds?: mongoose.Types.ObjectId[];
    emotionalContext?: string;
    patientNotes?: string;
  };

  // Metadata
  totalTokensUsed: number;
  model: string;
  isActive: boolean;
  title?: string; // Auto-generated conversation title

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ─────────────────────────────────────────────────
const aiChatSchema = new Schema<IAiChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "Session",
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    context: {
      recentAnalysisIds: [{ type: Schema.Types.ObjectId, ref: "VoiceAnalysis" }],
      emotionalContext: String,
      patientNotes: String,
    },
    totalTokensUsed: { type: Number, default: 0 },
    model: { type: String, default: "gpt-4o" },
    isActive: { type: Boolean, default: true },
    title: String,
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────
aiChatSchema.index({ userId: 1, createdAt: -1 });
aiChatSchema.index({ conversationId: 1 });
aiChatSchema.index({ userId: 1, isActive: 1 });

export const AiChat = mongoose.model<IAiChat>("AiChat", aiChatSchema);
