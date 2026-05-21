"use client";

import { GlassCard } from "./GlassCard";
import { AnimatedCounter } from "./AnimatedCounter";
import { Activity } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DUMMY_DATA = [
  { day: "Mon", stress: 42, recovery: 78 },
  { day: "Tue", stress: 55, recovery: 65 },
  { day: "Wed", stress: 38, recovery: 82 },
  { day: "Thu", stress: 62, recovery: 58 },
  { day: "Fri", stress: 48, recovery: 72 },
  { day: "Sat", stress: 35, recovery: 88 },
  { day: "Sun", stress: 30, recovery: 92 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

export function StressAnalytics() {
  const avgStress = Math.round(
    DUMMY_DATA.reduce((sum, d) => sum + d.stress, 0) / DUMMY_DATA.length
  );

  return (
    <GlassCard glow="red" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[60px]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Stress Analytics
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <AnimatedCounter
              value={avgStress}
              className="text-xl font-bold text-red-400"
            />
            <span className="text-xs text-white/30">avg</span>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[180px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DUMMY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="stress"
                name="Stress"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#stressGrad)"
                animationDuration={1500}
              />
              <Area
                type="monotone"
                dataKey="recovery"
                name="Recovery"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#recoveryGrad)"
                animationDuration={1800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-[10px] text-white/40">Stress Level</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-white/40">Recovery Score</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
