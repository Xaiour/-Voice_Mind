import { Request, Response } from "express";
import { VoiceService } from "../services/voice.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

/**
 * Voice Controller — handles audio upload, analysis, and history.
 */
export class VoiceController {
  /**
   * POST /api/voice/upload
   * Upload audio file and start analysis pipeline.
   */
  static upload = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest("No audio file provided.");
    }

    const result = await VoiceService.uploadAndAnalyze(
      req.userId!,
      req.file,
      req.body.sessionId
    );

    res.status(202).json({
      success: true,
      message: result.message,
      data: {
        analysisId: result.analysisId,
        status: result.status,
      },
    });
  });

  /**
   * POST /api/voice/analyze
   * Trigger analysis on a previously uploaded file (re-analyze).
   */
  static analyze = asyncHandler(async (req: Request, res: Response) => {
    const { analysisId } = req.body;

    if (!analysisId) {
      throw ApiError.badRequest("analysisId is required.");
    }

    const result = await VoiceService.reAnalyze(analysisId, req.userId!);

    res.status(202).json({
      success: true,
      message: result.message,
      data: {
        analysisId: result.analysisId,
        status: result.status,
      },
    });
  });

  /**
   * GET /api/voice/history
   * Get user's voice analysis history.
   */
  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await VoiceService.getHistory(req.userId!, page, limit);

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET /api/voice/analysis/:id
   * Get single analysis result.
   */
  static getAnalysis = asyncHandler(async (req: Request, res: Response) => {
    const analysis = await VoiceService.getAnalysisById(
      req.params.id,
      req.userId!
    );

    if (!analysis) {
      throw ApiError.notFound("Analysis not found.");
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  });
}
