import mongoose, { Schema, Document } from "mongoose";

// ─── Interface ──────────────────────────────────────────────
export interface IEmotionalTrend extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  period: "daily" | "weekly" | "monthly";

  // Aggregated emotional scores for the period
  averageSentiment: number; // 1-10
  dominantEmotion: string;
  emotionDistribution: {
    happy: number;
    sad: number;
    angry: number;
    fearful: number;
    neutral: number;
    surprised: number;
    disgusted: number;
  };

  // Voice metrics averages
  averagePitch: number;
  averageEnergy: number;
  averageSpeakingRate: number;

  // Trend indicators
  sentimentChange: number; // delta from previous period
  riskLevel: "low" | "moderate" | "high" | "critical";
  sessionsCount: number;
  totalAudioMinutes: number;

  // AI trend summary
  trendSummary?: string;
  alerts?: string[];

  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ─────────────────────────────────────────────────
const emotionalTrendSchema = new Schema<IEmotionalTrend>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },
    averageSentiment: {
      type: Number,
      min: 1,
      max: 10,
    },
    dominantEmotion: String,
    emotionDistribution: {
      happy: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
      fearful: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      surprised: { type: Number, default: 0 },
      disgusted: { type: Number, default: 0 },
    },
    averagePitch: Number,
    averageEnergy: Number,
    averageSpeakingRate: Number,
    sentimentChange: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "low",
    },
    sessionsCount: { type: Number, default: 0 },
    totalAudioMinutes: { type: Number, default: 0 },
    trendSummary: String,
    alerts: [String],
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────
emotionalTrendSchema.index({ userId: 1, date: -1 });
emotionalTrendSchema.index({ userId: 1, period: 1, date: -1 });
emotionalTrendSchema.index({ riskLevel: 1, date: -1 });

export const EmotionalTrend = mongoose.model<IEmotionalTrend>(
  "EmotionalTrend",
  emotionalTrendSchema
);
