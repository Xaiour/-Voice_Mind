"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  EmotionalScoreCard,
  StressAnalytics,
  AnxietyTrendGraph,
  EmotionalStabilityChart,
  VoiceUploadWidget,
  AIRecommendationsPanel,
  WellnessInsights,
  RecentAnalysesTable,
} from "@/components/dashboard";

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);

  // Check for fresh analysis results from voice check-in
  useEffect(() => {
    const stored = localStorage.getItem("voicemind-latest-analysis");
    if (stored) {
      try {
        setLatestAnalysis(JSON.parse(stored));
        // Clear it after reading so it only shows once
        localStorage.removeItem("voicemind-latest-analysis");
      } catch {}
    }
  }, []);

  // Helper to get user-friendly emotion label
  const getEmotionEmoji = (emotion: string) => {
    const lower = (emotion || "").toLowerCase();
    if (lower.includes("calm") || lower.includes("stable")) return "😌";
    if (lower.includes("happy") || lower.includes("positive")) return "😊";
    if (lower.includes("stress") || lower.includes("tense")) return "😰";
    if (lower.includes("anxious") || lower.includes("nervous")) return "😟";
    if (lower.includes("sad") || lower.includes("fatigue") || lower.includes("low")) return "😔";
    return "🙂";
  };

  const getScoreLabel = (score: number) => {
    if (score < 30) return { text: "Low", color: "text-emerald-400" };
    if (score < 60) return { text: "Moderate", color: "text-amber-400" };
    return { text: "High", color: "text-red-400" };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Wellness Dashboard
          </span>
        </h1>
        <p className="text-sm text-white/40 mt-1">
          AI-powered emotional wellness tracking at a glance.
        </p>
      </motion.div>

      {/* ─── Latest Analysis Banner (shows after voice check-in) ─── */}
      {latestAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="mb-6 p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/[0.05] to-cyan-500/[0.03] backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 flex-wrap">
            {/* Emoji */}
            <span className="text-4xl">
              {getEmotionEmoji(latestAnalysis.emotions?.primary || "")}
            </span>

            {/* Main info */}
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-purple-300/60 font-medium uppercase tracking-wider mb-1">
                Your emotional analysis
              </p>
              <p className="text-lg font-semibold text-white/90 capitalize">
                You seem {latestAnalysis.emotions?.primary || "balanced"}
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                Just now — based on your voice patterns
              </p>
            </div>

            {/* Quick scores */}
            {latestAnalysis.aiInsights && (
              <div className="flex gap-4">
                {[
                  { label: "Stress", value: Math.max(0, 100 - (latestAnalysis.aiInsights.sentimentScore || 5) * 10) },
                  { label: "Mood", value: (latestAnalysis.aiInsights.sentimentScore || 5) * 10 },
                ].map((item) => {
                  const scoreInfo = item.label === "Mood"
                    ? (item.value > 60 ? { text: "Good", color: "text-emerald-400" } : { text: "Low", color: "text-amber-400" })
                    : getScoreLabel(item.value);
                  return (
                    <div key={item.label} className="text-center">
                      <p className="text-[10px] text-white/30 uppercase">{item.label}</p>
                      <p className={`text-sm font-bold ${scoreInfo.color}`}>{scoreInfo.text}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Suggestion */}
            <div className="w-full mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-purple-300/50 mb-1">💡 Suggestion</p>
              <p className="text-sm text-white/50">
                {latestAnalysis.aiInsights?.sentimentScore > 6
                  ? "You're in a good place! Keep nurturing what's working for you today."
                  : latestAnalysis.aiInsights?.sentimentScore > 4
                  ? "Consider a short 5-minute break. A walk or some water can help reset your energy."
                  : "Be gentle with yourself today. Try 3 deep breaths — inhale 4s, hold 4s, exhale 6s."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dashboard Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
      >
        {/* Row 1: Score Card + Stress + Upload + Wellness */}
        <motion.div variants={staggerItem} className="xl:col-span-1">
          <EmotionalScoreCard />
        </motion.div>

        <motion.div variants={staggerItem} className="xl:col-span-1">
          <WellnessInsights />
        </motion.div>

        <motion.div variants={staggerItem} className="xl:col-span-1">
          <VoiceUploadWidget />
        </motion.div>

        <motion.div variants={staggerItem} className="xl:col-span-1">
          <EmotionalStabilityChart />
        </motion.div>

        {/* Row 2: Stress Analytics (wide) + Anxiety Trend (wide) */}
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <StressAnalytics />
        </motion.div>

        <motion.div variants={staggerItem} className="xl:col-span-2">
          <AnxietyTrendGraph />
        </motion.div>

        {/* Row 3: AI Recommendations + Recent Analyses */}
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <AIRecommendationsPanel />
        </motion.div>

        <motion.div variants={staggerItem} className="xl:col-span-2">
          <RecentAnalysesTable />
        </motion.div>
      </motion.div>
    </div>
  );
}
