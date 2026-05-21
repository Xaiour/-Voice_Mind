"use client";

import { useState, useEffect } from "react";

interface AnalysisData {
  _id: string;
  status: string;
  audioFileName: string;
  createdAt: string;
  voiceFeatures?: {
    pitch?: { mean: number; std: number };
    energy?: { mean: number };
    speakingRate?: number;
    pauseFrequency?: number;
  };
  emotions?: {
    primary: string;
    confidence: number;
    distribution?: Record<string, number>;
  };
  aiInsights?: {
    sentimentScore: number;
    emotionalState: string;
    riskIndicators?: string[];
  };
}

interface DashboardData {
  analyses: AnalysisData[];
  latest: AnalysisData | null;
  isLoading: boolean;
  stats: {
    totalSessions: number;
    avgSentiment: number;
    stressLevel: number;
    anxietyLevel: number;
    energyLevel: number;
    moodScore: number;
  };
}

/**
 * Shared hook that fetches real analysis data from the backend.
 * All dashboard widgets use this single source of truth.
 */
export function useDashboardData(): DashboardData {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const authData = localStorage.getItem("voicemind-auth");
      const token = authData ? JSON.parse(authData)?.state?.accessToken : null;

      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/voice/history?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        setAnalyses(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Also check localStorage for the latest analysis (from voice check-in redirect)
  const localLatest = (() => {
    try {
      const stored = localStorage.getItem("voicemind-latest-analysis");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const completed = analyses.filter((a) => a.status === "completed");
  const latest = completed[0] || localLatest;

  // Compute aggregate stats from all completed analyses
  const avgSentiment = completed.length > 0
    ? completed.reduce((sum, a) => sum + (a.aiInsights?.sentimentScore || 5), 0) / completed.length
    : 5;

  const avgStress = completed.length > 0
    ? Math.max(0, 100 - avgSentiment * 10)
    : 35;

  const avgAnxiety = completed.length > 0
    ? completed.reduce((sum, a) => {
        const fearful = a.emotions?.distribution?.fearful || 0;
        return sum + fearful * 100;
      }, 0) / completed.length
    : 25;

  const energyLevel = completed.length > 0
    ? completed.reduce((sum, a) => {
        const sad = a.emotions?.distribution?.sad || 0;
        return sum + (100 - sad * 100);
      }, 0) / completed.length
    : 72;

  return {
    analyses,
    latest,
    isLoading,
    stats: {
      totalSessions: analyses.length,
      avgSentiment: Math.round(avgSentiment * 10) / 10,
      stressLevel: Math.round(avgStress),
      anxietyLevel: Math.round(avgAnxiety),
      energyLevel: Math.round(energyLevel),
      moodScore: Math.round(avgSentiment * 10),
    },
  };
}
