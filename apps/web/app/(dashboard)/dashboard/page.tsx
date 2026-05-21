"use client";

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
        className="mb-8"
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
