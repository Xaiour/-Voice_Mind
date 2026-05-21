export interface VoiceMetrics {
  pitch: number;
  pitch_variability: number;
  speech_rate: number;
  energy: number;
  pause_ratio: number;
  jitter: number;
}

export interface VoiceAnalysisResult {
  stress_score: number;
  anxiety_score: number;
  depression_score: number;
  emotion: string;
  confidence: number;
  metrics: VoiceMetrics;
  mfccs: number[];
  duration: number;
  indicators: string[];
}

export interface AiInsights {
  sentimentScore: number;
  summary: string;
  clinicalObservations: string[];
  riskIndicators: string[];
  recommendations: string[];
  emotionalState: string;
  confidenceLevel: number;
}

export interface VoiceAnalysis {
  _id: string;
  userId: string;
  sessionId?: string;
  audioFileUrl: string;
  audioFileName: string;
  audioDuration?: number;
  fileSize: number;
  mimeType: string;
  status: "pending" | "processing" | "completed" | "failed";
  voiceFeatures?: {
    pitch: { mean: number; min: number; max: number; std: number };
    energy: { mean: number; max: number };
    speakingRate: number;
    pauseFrequency: number;
    voiceQuality: number;
  };
  emotions?: {
    primary: string;
    confidence: number;
    distribution: Record<string, number>;
  };
  transcript?: string;
  aiInsights?: AiInsights;
  processingTime?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmotionalTrend {
  _id: string;
  userId: string;
  date: string;
  period: "daily" | "weekly" | "monthly";
  averageSentiment: number;
  dominantEmotion: string;
  riskLevel: "low" | "moderate" | "high" | "critical";
  sessionsCount: number;
}
