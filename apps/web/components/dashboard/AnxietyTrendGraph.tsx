"use client";

import { GlassCard } from "./GlassCard";
import { TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const DUMMY_DATA = [
  { date: "Jan", anxiety: 68, threshold: 50 },
  { date: "Feb", anxiety: 72, threshold: 50 },
  { date: "Mar", anxiety: 58, threshold: 50 },
  { date: "Apr", anxiety: 63, threshold: 50 },
  { date: "May", anxiety: 52, threshold: 50 },
  { date: "Jun", anxiety: 45, threshold: 50 },
  { date: "Jul", anxiety: 48, threshold: 50 },
  { date: "Aug", anxiety: 42, threshold: 50 },
  { date: "Sep", anxiety: 38, threshold: 50 },
  { date: "Oct", anxiety: 35, threshold: 50 },
  { date: "Nov", anxiety: 32, threshold: 50 },
  { date: "Dec", anxiety: 28, threshold: 50 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-xs font-medium text-amber-400">
        Anxiety: {payload[0]?.value}%
      </p>
    </div>
  );
};

export function AnxietyTrendGraph() {
  return (
    <GlassCard glow="amber" className="relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/5 rounded-full blur-[60px]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Anxiety Trend (12 Months)
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            -58% improvement
          </span>
        </div>

        {/* Chart */}
        <div className="h-[200px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DUMMY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="anxietyLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
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
              <ReferenceLine
                y={50}
                stroke="rgba(255,255,255,0.1)"
                strokeDasharray="4 4"
                label={{
                  value: "Threshold",
                  position: "right",
                  fill: "rgba(255,255,255,0.2)",
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="anxiety"
                stroke="url(#anxietyLineGrad)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#f59e0b", stroke: "#f59e0b" }}
                activeDot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}
