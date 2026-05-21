"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";
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
  const { latest, stats } = useDashboardData();
  const [latestBanner, setLatestBanner] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("voicemind-latest-analysis");
    if (stored) {
      try {
        setLatestBanner(JSON.parse(stored));
        localStorage.removeItem("voicemind-latest-analysis");
      } catch {}
    }
  }, []);

  const getEmoji = (emotion: string) => {
    const l = (emotion || "").toLowerCase();
    if (l.includes("calm") || l.includes("stable")) return "😌";
    if (l.includes("happy") || l.includes("positive")) return "😊";
    if (l.includes("stress") || l.includes("tense")) return "😰";
    if (l.includes("anxious")) return "😟";
    if (l.includes("sad") || l.includes("fatigue")) return "😔";
    return "🙂";
  };

  const showBanner = latestBanner || latest;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Wellness Dashboard
          </span>
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {stats.totalSessions > 0
            ? `${stats.totalSessions} sessions analyzed — here's your emotional overview.`
            : "AI-powered emotional wellness tracking at a glance."}
        </p>
      </motion.div>

      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="mb-6 p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/[0.05] to-cyan-500/[0.03]"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-4xl">{getEmoji(showBanner?.emotions?.primary || "")}</span>
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-purple-300/60 font-medium uppercase tracking-wider mb-1">Latest Check-In</p>
              <p className="text-lg font-semibold text-white/90 capitalize">
                You seem {showBanner?.emotions?.primary || "balanced"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 w-full mt-2">
              <p className="text-xs text-purple-300/60 mb-1">💡 Suggestion</p>
              <p className="text-sm text-white/50">
                {stats.stressLevel > 60
                  ? "Try a 5-minute breathing exercise between tasks."
                  : stats.moodScore > 70
                  ? "You're doing well! Keep up your current wellness routine."
                  : "Consider a short walk or hydration break to boost your energy."}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
      >
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
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <StressAnalytics />
        </motion.div>
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <AnxietyTrendGraph />
        </motion.div>
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
