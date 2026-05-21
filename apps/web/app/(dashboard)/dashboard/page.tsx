"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";
import { GlassCard } from "@/components/dashboard/GlassCard";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import {
  HeartPulse,
  Activity,
  Brain,
  TrendingDown,
  Mic,
  Sparkles,
  Clock,
  Shield,
  FileAudio,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function DashboardPage() {
  const { analyses, latest, isLoading, stats } = useDashboardData();
  const [latestBanner, setLatestBanner] = useState<any>(null);

  // Check for fresh analysis from voice check-in redirect
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
    if (l.includes("sad") || l.includes("fatigue") || l.includes("low")) return "😔";
    return "🙂";
  };

  const getBarColor = (value: number) => {
    if (value < 30) return "from-emerald-500 to-emerald-400";
    if (value < 60) return "from-amber-500 to-amber-400";
    return "from-red-500 to-red-400";
  };

  const getLabel = (value: number) => {
    if (value < 30) return { text: "Low", color: "text-emerald-400" };
    if (value < 60) return { text: "Moderate", color: "text-amber-400" };
    return { text: "High", color: "text-red-400" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" className={i >= 4 ? "xl:col-span-2" : ""} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Wellness Dashboard
          </span>
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {analyses.length > 0
            ? `${analyses.length} sessions analyzed — here's your emotional overview.`
            : "Record a voice check-in to see your wellness data here."}
        </p>
      </motion.div>

      {/* Latest Analysis Banner */}
      {(latestBanner || latest) && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="mb-6 p-5 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/[0.05] to-cyan-500/[0.03]"
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-4xl">
              {getEmoji((latestBanner || latest)?.emotions?.primary || "")}
            </span>
            <div className="flex-1 min-w-[200px]">
              <p className="text-xs text-purple-300/60 font-medium uppercase tracking-wider mb-1">Latest Check-In</p>
              <p className="text-lg font-semibold text-white/90 capitalize">
                You seem {(latestBanner || latest)?.emotions?.primary || "balanced"}
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-[10px] text-white/30 uppercase">Mood</p>
                <p className="text-sm font-bold text-emerald-400">
                  {Math.round(((latestBanner || latest)?.aiInsights?.sentimentScore || 5) * 10)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-white/30 uppercase">Stress</p>
                <p className={`text-sm font-bold ${getLabel(stats.stressLevel).color}`}>
                  {getLabel(stats.stressLevel).text}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dashboard Grid */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* 1. Emotional Score */}
        <motion.div variants={staggerItem}>
          <GlassCard glow="green">
            <div className="flex items-center gap-2 mb-3">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-white/50 uppercase tracking-wider">Emotional Score</span>
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter value={stats.moodScore} className="text-4xl font-bold text-emerald-400" />
              <span className="text-lg text-white/30">/100</span>
            </div>
            <p className="text-xs text-white/30 mt-2">
              {stats.moodScore > 70 ? "You're doing great!" : stats.moodScore > 40 ? "Room for improvement" : "Take it easy today"}
            </p>
          </GlassCard>
        </motion.div>

        {/* 2. Stress Level */}
        <motion.div variants={staggerItem}>
          <GlassCard glow="red">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-red-400" />
              <span className="text-xs text-white/50 uppercase tracking-wider">Stress Level</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <AnimatedCounter value={stats.stressLevel} className={`text-4xl font-bold ${getLabel(stats.stressLevel).color}`} />
              <span className="text-lg text-white/30">/100</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.stressLevel}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${getBarColor(stats.stressLevel)}`}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* 3. Anxiety */}
        <motion.div variants={staggerItem}>
          <GlassCard glow="amber">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-white/50 uppercase tracking-wider">Anxiety</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <AnimatedCounter value={stats.anxietyLevel} className={`text-4xl font-bold ${getLabel(stats.anxietyLevel).color}`} />
              <span className="text-lg text-white/30">/100</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.anxietyLevel}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${getBarColor(stats.anxietyLevel)}`}
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* 4. Energy */}
        <motion.div variants={staggerItem}>
          <GlassCard glow="cyan">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white/50 uppercase tracking-wider">Energy</span>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <AnimatedCounter value={stats.energyLevel} className="text-4xl font-bold text-cyan-400" />
              <span className="text-lg text-white/30">/100</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.energyLevel}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
              />
            </div>
          </GlassCard>
        </motion.div>

        {/* 5. Sessions Overview (wide) */}
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <GlassCard glow="purple">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-white/50 uppercase tracking-wider">Voice Sessions</span>
              </div>
              <span className="text-xs text-white/30">{stats.totalSessions} total</span>
            </div>
            {analyses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm">No sessions yet</p>
                <p className="text-white/20 text-xs mt-1">Record your first voice check-in to see data here</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {analyses.slice(0, 6).map((a, i) => (
                  <motion.div
                    key={a._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center">
                      <FileAudio className="w-3.5 h-3.5 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/60 truncate">{a.audioFileName}</p>
                      <p className="text-[10px] text-white/25">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      a.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                      a.status === "processing" ? "bg-amber-500/10 text-amber-400" :
                      "bg-red-500/10 text-red-400"
                    }`}>
                      {a.status}
                    </span>
                    {a.emotions?.primary && (
                      <span className="text-xs text-white/40 capitalize hidden sm:block">
                        {a.emotions.primary}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* 6. AI Insights (wide) */}
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <GlassCard glow="pink">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-white/50 uppercase tracking-wider">AI Insights</span>
            </div>
            {latest ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-xs text-white/30 mb-1">Current emotional state</p>
                  <p className="text-sm text-white/70 capitalize">
                    {latest.aiInsights?.emotionalState || latest.emotions?.primary || "Balanced"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-xs text-purple-300/60 mb-1">💡 Recommendation</p>
                  <p className="text-sm text-white/50">
                    {stats.stressLevel > 60
                      ? "Your stress levels are elevated. Try a 5-minute breathing exercise between tasks."
                      : stats.anxietyLevel > 50
                      ? "Some anxiety markers detected. Ground yourself with the 5-4-3-2-1 technique."
                      : stats.moodScore > 70
                      ? "You're doing well! Keep up your current wellness routine."
                      : "Consider a short walk or hydration break to boost your energy."}
                  </p>
                </div>
                {latest.aiInsights?.riskIndicators && latest.aiInsights.riskIndicators.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-xs text-amber-300/60 mb-1">⚠️ Attention</p>
                    <p className="text-sm text-white/50">
                      {latest.aiInsights.riskIndicators.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm">No insights yet</p>
                <p className="text-white/20 text-xs mt-1">Complete a voice check-in to get AI-powered insights</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* 7. Wellness Summary (wide) */}
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <GlassCard glow="amber">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-white/50 uppercase tracking-wider">Wellness Summary</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Overall Mood", value: stats.moodScore, icon: "😊" },
                { label: "Stress Management", value: Math.max(0, 100 - stats.stressLevel), icon: "🧘" },
                { label: "Emotional Energy", value: stats.energyLevel, icon: "⚡" },
                { label: "Calmness", value: Math.max(0, 100 - stats.anxietyLevel), icon: "🌿" },
              ].map((item, i) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">{item.icon} {item.label}</span>
                    <span className="text-xs text-white/40">{item.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${
                        item.value > 70 ? "from-emerald-500 to-emerald-400" :
                        item.value > 40 ? "from-amber-500 to-amber-400" :
                        "from-red-500 to-red-400"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* 8. Quick Actions (wide) */}
        <motion.div variants={staggerItem} className="xl:col-span-2">
          <GlassCard glow="cyan">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-white/50 uppercase tracking-wider">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href="/voice" className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/20 hover:bg-white/[0.04] transition group">
                <Mic className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition" />
                <p className="text-sm text-white/70 font-medium">New Check-In</p>
                <p className="text-[10px] text-white/30 mt-0.5">Record a voice session</p>
              </a>
              <a href="/chat" className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] transition group">
                <Brain className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition" />
                <p className="text-sm text-white/70 font-medium">AI Chat</p>
                <p className="text-[10px] text-white/30 mt-0.5">Talk to your wellness companion</p>
              </a>
            </div>
          </GlassCard>
        </motion.div>

      </motion.div>
    </div>
  );
}
