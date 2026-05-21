"use client";

import { GlassCard } from "./GlassCard";
import { Shield } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const DUMMY_DATA = [
  { dimension: "Calmness", value: 82, fullMark: 100 },
  { dimension: "Resilience", value: 68, fullMark: 100 },
  { dimension: "Self-Regulation", value: 74, fullMark: 100 },
  { dimension: "Mood Stability", value: 85, fullMark: 100 },
  { dimension: "Social Ease", value: 62, fullMark: 100 },
  { dimension: "Positivity", value: 78, fullMark: 100 },
];

export function EmotionalStabilityChart() {
  return (
    <GlassCard glow="cyan" className="relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Emotional Stability
          </span>
        </div>

        {/* Radar Chart */}
        <div className="h-[240px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={DUMMY_DATA} cx="50%" cy="50%" outerRadius="70%">
              <defs>
                <linearGradient id="radarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9 }}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(26,26,46,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                itemStyle={{ color: "#06b6d4" }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#radarGrad)"
                animationDuration={1500}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Stability Score */}
        <div className="text-center -mt-2">
          <span className="text-xs text-white/30">Overall Stability Score: </span>
          <span className="text-sm font-bold text-cyan-400">74.8/100</span>
        </div>
      </div>
    </GlassCard>
  );
}
