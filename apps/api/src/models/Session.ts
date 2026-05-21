import mongoose, { Schema, Document } from "mongoose";

// ─── Interface ──────────────────────────────────────────────
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: "voice_recording" | "upload" | "live_session";
  status: "active" | "completed" | "cancelled";

  // Session timing
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds

  // Associated data
  analysisIds: mongoose.Types.ObjectId[];
  chatIds: mongoose.Types.ObjectId[];

  // Session notes
  notes?: string;
  tags?: string[];

  // Mood tracking (user self-report)
  moodBefore?: number; // 1-10
  moodAfter?: number; // 1-10

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ─────────────────────────────────────────────────
const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Session title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["voice_recording", "upload", "live_session"],
      default: "voice_recording",
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: Date,
    duration: Number,
    analysisIds: [{ type: Schema.Types.ObjectId, ref: "VoiceAnalysis" }],
    chatIds: [{ type: Schema.Types.ObjectId, ref: "AiChat" }],
    notes: String,
    tags: [String],
    moodBefore: { type: Number, min: 1, max: 10 },
    moodAfter: { type: Number, min: 1, max: 10 },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ tags: 1 });

export const Session = mongoose.model<ISession>("Session", sessionSchema);
