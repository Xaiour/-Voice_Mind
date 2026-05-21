import mongoose, { Schema, Document } from "mongoose";

// ─── Interface ──────────────────────────────────────────────
export interface IVoiceAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  audioFileUrl: string;
  audioFileName: string;
  audioDuration?: number; // in seconds
  fileSize: number; // in bytes
  mimeType: string;
  status: "pending" | "processing" | "completed" | "failed";

  // Voice Features (from Python service)
  voiceFeatures?: {
    pitch: { mean: number; min: number; max: number; std: number };
    energy: { mean: number; max: number };
    speakingRate: number; // words per minute
    pauseFrequency: number;
    voiceQuality: number; // 0-1 score
    mfccFeatures?: number[];
  };

  // Emotion Detection
  emotions?: {
    primary: string; // dominant emotion
    confidence: number;
    distribution: {
      happy: number;
      sad: number;
      angry: number;
      fearful: number;
      neutral: number;
      surprised: number;
      disgusted: number;
    };
  };

  // Transcript
  transcript?: string;

  // AI-Generated Insights (from OpenAI)
  aiInsights?: {
    sentimentScore: number; // 1-10
    summary: string;
    clinicalObservations: string[];
    riskIndicators: string[];
    recommendations: string[];
    emotionalState: string;
    confidenceLevel: number;
  };

  // Processing metadata
  processingTime?: number; // ms
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ─────────────────────────────────────────────────
const voiceAnalysisSchema = new Schema<IVoiceAnalysis>(
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
    audioFileUrl: {
      type: String,
      required: [true, "Audio file URL is required"],
    },
    audioFileName: {
      type: String,
      required: true,
    },
    audioDuration: Number,
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    voiceFeatures: {
      pitch: {
        mean: Number,
        min: Number,
        max: Number,
        std: Number,
      },
      energy: {
        mean: Number,
        max: Number,
      },
      speakingRate: Number,
      pauseFrequency: Number,
      voiceQuality: Number,
      mfccFeatures: [Number],
    },
    emotions: {
      primary: String,
      confidence: Number,
      distribution: {
        happy: Number,
        sad: Number,
        angry: Number,
        fearful: Number,
        neutral: Number,
        surprised: Number,
        disgusted: Number,
      },
    },
    transcript: String,
    aiInsights: {
      sentimentScore: Number,
      summary: String,
      clinicalObservations: [String],
      riskIndicators: [String],
      recommendations: [String],
      emotionalState: String,
      confidenceLevel: Number,
    },
    processingTime: Number,
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────
voiceAnalysisSchema.index({ userId: 1, createdAt: -1 });
voiceAnalysisSchema.index({ status: 1, createdAt: -1 });
voiceAnalysisSchema.index({ sessionId: 1 });

export const VoiceAnalysis = mongoose.model<IVoiceAnalysis>(
  "VoiceAnalysis",
  voiceAnalysisSchema
);
