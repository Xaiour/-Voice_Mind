"use client";

import { GlassCard } from "./GlassCard";
import { AnimatedCounter } from "./AnimatedCounter";
import { motion } from "framer-motion";
import { Zap, Sun, CloudRain, Wind } from "lucide-react";

const INSIGHTS = [
  {
    icon: Sun,
    label: "Mood Score",
    value: 7.4,
    max: 10,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    barColor: "from-amber-500 to-amber-300",
    progress: 74,
  },
  {
    icon: Zap,
    label: "Energy Level",
    value: 6.8,
    max: 10,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    barColor: "from-cyan-500 to-cyan-300",
    progress: 68,
  },
  {
    icon: CloudRain,
    label: "Sadness Index",
    value: 2.1,
    max: 10,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    barColor: "from-blue-500 to-blue-300",
    progress: 21,
  },
  {
    icon: Wind,
    label: "Calm Score",
    value: 8.2,
    max: 10,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    barColor: "from-emerald-500 to-emerald-300",
    progress: 82,
  },
];

export function WellnessInsights() {
  return (
    <GlassCard glow="amber" className="relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[60px]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Wellness Insights
          </span>
        </div>

        {/* Insight Items */}
        <div className="space-y-4">
          {INSIGHTS.map((insight, i) => (
            <motion.div
              key={insight.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${insight.bg} flex items-center justify-center`}>
                    <insight.icon className={`w-3.5 h-3.5 ${insight.color}`} />
                  </div>
                  <span className="text-xs text-white/60 font-medium">{insight.label}</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <AnimatedCounter
                    value={insight.value}
                    decimals={1}
                    className={`text-sm font-bold ${insight.color}`}
                  />
                  <span className="text-[10px] text-white/20">/{insight.max}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${insight.progress}%` }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${insight.barColor} opacity-80`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
