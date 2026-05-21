"use client";

import { GlassCard } from "./GlassCard";
import { AnimatedCounter } from "./AnimatedCounter";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

interface EmotionalScoreCardProps {
  score?: number; // 0-100
  label?: string;
  trend?: "up" | "down" | "stable";
}

const DUMMY_SCORE = 78;

export function EmotionalScoreCard({
  score = DUMMY_SCORE,
  label = "Emotional Wellbeing",
  trend = "up",
}: EmotionalScoreCardProps) {
  const chartData = [{ value: score, fill: "url(#scoreGradient)" }];

  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-emerald-400";
    if (s >= 45) return "text-amber-400";
    return "text-red-400";
  };

  const getTrendLabel = () => {
    if (trend === "up") return { text: "+4.2% this week", color: "text-emerald-400" };
    if (trend === "down") return { text: "-2.1% this week", color: "text-red-400" };
    return { text: "Stable this week", color: "text-white/40" };
  };

  const trendInfo = getTrendLabel();

  return (
    <GlassCard glow="green" className="relative overflow-hidden">
      {/* Subtle glow behind the chart */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]" />

      <div className="relative flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              {label}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <AnimatedCounter
              value={score}
              className={`text-4xl font-bold ${getScoreColor(score)}`}
            />
            <span className="text-lg text-white/30 font-medium">/100</span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-xs ${trendInfo.color}`}
          >
            {trendInfo.text}
          </motion.p>
        </div>

        {/* Radial Chart */}
        <div className="w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={10}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "rgba(255,255,255,0.03)" }}
                dataKey="value"
                cornerRadius={10}
                animationDuration={1500}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}
