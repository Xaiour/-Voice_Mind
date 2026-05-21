import axios from "axios";
import { env } from "../config/env";
import { VoiceAnalysis, IVoiceAnalysis } from "../models/VoiceAnalysis";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { OpenAIService } from "./openai.service";
import { redis } from "../config/redis";
import FormData from "form-data";
import fs from "fs";

interface UploadResult {
  analysisId: string;
  status: string;
  message: string;
}

interface VoiceFeatures {
  pitch: { mean: number; min: number; max: number; std: number };
  energy: { mean: number; max: number };
  speakingRate: number;
  pauseFrequency: number;
  voiceQuality: number;
  mfccFeatures: number[];
  transcript: string;
  emotions: {
    primary: string;
    confidence: number;
    distribution: Record<string, number>;
  };
}

export class VoiceService {
  /**
   * Handle audio file upload and initiate analysis pipeline.
   *
   * Flow: Upload → Save metadata → Call Python service → OpenAI → Save results
   */
  static async uploadAndAnalyze(
    userId: string,
    file: Express.Multer.File,
    sessionId?: string
  ): Promise<UploadResult> {
    // 1. Create initial analysis record
    const analysis = await VoiceAnalysis.create({
      userId,
      sessionId,
      audioFileUrl: file.path,
      audioFileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: "pending",
    });

    // 2. Trigger async analysis (non-blocking)
    this.processAnalysis(analysis._id.toString(), file.path).catch((error) => {
      logger.error(`Analysis failed for ${analysis._id}:`, error);
    });

    return {
      analysisId: analysis._id.toString(),
      status: "processing",
      message: "Audio uploaded successfully. Analysis in progress.",
    };
  }

  /**
   * Full analysis pipeline (runs asynchronously).
   */
  static async processAnalysis(analysisId: string, filePath: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Update status to processing
      await VoiceAnalysis.findByIdAndUpdate(analysisId, { status: "processing" });

      // Stage 1: Send to Python voice analysis service
      logger.info(`[Analysis ${analysisId}] Stage 1: Voice processing...`);
      const voiceFeatures = await this.callPythonService(filePath);

      // Stage 2: Get AI insights from OpenAI
      logger.info(`[Analysis ${analysisId}] Stage 2: AI insight generation...`);
      const aiInsights = await OpenAIService.generateAnalysisInsights({
        transcript: voiceFeatures.transcript,
        emotions: voiceFeatures.emotions,
        voiceMetrics: {
          pitch: voiceFeatures.pitch,
          energy: voiceFeatures.energy,
          speakingRate: voiceFeatures.speakingRate,
        },
      });

      // Stage 3: Save complete results
      const processingTime = Date.now() - startTime;

      await VoiceAnalysis.findByIdAndUpdate(analysisId, {
        status: "completed",
        voiceFeatures: {
          pitch: voiceFeatures.pitch,
          energy: voiceFeatures.energy,
          speakingRate: voiceFeatures.speakingRate,
          pauseFrequency: voiceFeatures.pauseFrequency,
          voiceQuality: voiceFeatures.voiceQuality,
          mfccFeatures: voiceFeatures.mfccFeatures,
        },
        emotions: voiceFeatures.emotions,
        transcript: voiceFeatures.transcript,
        aiInsights,
        processingTime,
      });

      // Invalidate cache
      const analysis = await VoiceAnalysis.findById(analysisId);
      if (analysis) {
        await redis.del(`voice_history:${analysis.userId}`);
      }

      logger.info(
        `[Analysis ${analysisId}] Complete in ${processingTime}ms`
      );
    } catch (error: any) {
      await VoiceAnalysis.findByIdAndUpdate(analysisId, {
        status: "failed",
        errorMessage: error.message,
        processingTime: Date.now() - startTime,
      });
      throw error;
    }
  }

  /**
   * Call Python voice analysis microservice.
   */
  private static async callPythonService(filePath: string): Promise<VoiceFeatures> {
    try {
      const formData = new FormData();
      formData.append("audio", fs.createReadStream(filePath));

      const response = await axios.post(
        `${env.VOICE_SERVICE_URL}/api/analyze`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 30000, // 30s timeout
          maxContentLength: 50 * 1024 * 1024,
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error("Python service error:", error.message);
      throw ApiError.internal(
        `Voice analysis service unavailable: ${error.message}`
      );
    }
  }

  /**
   * Get analysis by ID.
   */
  static async getAnalysisById(
    analysisId: string,
    userId: string
  ): Promise<IVoiceAnalysis | null> {
    return VoiceAnalysis.findOne({ _id: analysisId, userId });
  }

  /**
   * Get user's analysis history (with Redis caching).
   */
  static async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const cacheKey = `voice_history:${userId}:${page}:${limit}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      VoiceAnalysis.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VoiceAnalysis.countDocuments({ userId }),
    ]);

    const result = {
      data: analyses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  /**
   * Trigger re-analysis on an existing audio file.
   */
  static async reAnalyze(analysisId: string, userId: string): Promise<UploadResult> {
    const analysis = await VoiceAnalysis.findOne({ _id: analysisId, userId });
    if (!analysis) {
      throw ApiError.notFound("Analysis not found.");
    }

    // Reset status and re-process
    analysis.status = "pending";
    await analysis.save();

    this.processAnalysis(analysisId, analysis.audioFileUrl).catch((error) => {
      logger.error(`Re-analysis failed for ${analysisId}:`, error);
    });

    return {
      analysisId,
      status: "processing",
      message: "Re-analysis initiated.",
    };
  }
}
