"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ParticleBackground } from "@/components/three-d";
import {
  AreaChart, Area, BarChart, Bar, RadialBarChart, RadialBar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// Lazy-load orb only when dashboard has data (keeps empty state fast)
const EmotionalOrb = dynamic(() => import("@/components/three-d/EmotionalOrb"), { ssr: false });

type EmotionType = "calm" | "energetic" | "anxious" | "joyful";

function mapEmotionToType(emotion: string | undefined): EmotionType {
  if (!emotion) return "calm";
  const lower = emotion.toLowerCase();
  if (lower.includes("happy") || lower.includes("joy") || lower.includes("positive")) return "joyful";
  if (lower.includes("energy") || lower.includes("energetic") || lower.includes("excited")) return "energetic";
  if (lower.includes("anxious") || lower.includes("fear") || lower.includes("stress") || lower.includes("tense")) return "anxious";
  return "calm";
}

// ─── Empty State (No Sessions) ──────────────────────────────
function EmptyDashboard() {
  return (
    <div className="relative min-h-screen text-slate-100 font-sans select-none overflow-x-hidden" style={{ backgroundColor: "#050510" }}>
      <ParticleBackground />

      <header className="w-full px-6 py-4 relative z-10">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full glass-panel">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              &larr; Home
            </Link>
            <div className="w-[1px] h-4 bg-slate-800" />
            <span className="text-sm font-bold text-neon-gradient">Dashboard</span>
          </div>
          <Link
            href="/settings"
            className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center font-bold text-xs text-slate-300 hover:border-slate-600 transition-colors"
          >
            VM
          </Link>
        </nav>
      </header>

      <main className="w-full max-w-2xl mx-auto px-6 py-20 relative z-10 flex flex-col items-center text-center gap-8">
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
          <span className="text-4xl">🎙️</span>
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">
            No data yet
          </h1>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Your dashboard will come alive after your first voice check-in. Record a 30-second sample and we&apos;ll analyze your vocal biomarkers — stress, energy, pitch, and emotional state.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/voice"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-sm hover:brightness-110 shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 text-center"
          >
            Record First Check-In
          </Link>
          <p className="text-[10px] text-slate-600">Takes less than 30 seconds</p>
        </div>

        {/* Preview of what they'll see */}
        <div className="w-full mt-8 glass-card rounded-2xl p-6 text-left">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">What you&apos;ll see after recording:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">📊</div>
              <span className="text-xs text-slate-400">Mood & Stress Trends</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs">🎵</div>
              <span className="text-xs text-slate-400">Voice Biomarkers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-950/40 border border-pink-500/20 flex items-center justify-center text-pink-400 text-xs">⚡</div>
              <span className="text-xs text-slate-400">Energy & Wellness Score</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">📈</div>
              <span className="text-xs text-slate-400">Session History</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Main Dashboard (Has Data) ──────────────────────────────
export default function DashboardPage() {
  const { analyses, latest, isLoading, stats } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#050510" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading your emotional data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no sessions
  if (stats.totalSessions === 0) {
    return <EmptyDashboard />;
  }

  // Build chart data from analyses
  const moodTrendData = analyses.slice(0, 7).reverse().map((a, i) => ({
    session: `S${i + 1}`,
    mood: Math.round((a.aiInsights?.sentimentScore || 5) * 10),
    stress: Math.round(100 - (a.aiInsights?.sentimentScore || 5) * 10),
    energy: Math.round((1 - (a.emotions?.distribution?.sad || 0)) * 100),
  }));

  // Voice metrics from latest analysis
  const voiceMetrics = latest?.voiceFeatures
    ? [
        { name: "Pitch", value: Math.round(latest.voiceFeatures.pitch?.mean || 0), unit: "Hz" },
        { name: "Energy", value: Math.round((latest.voiceFeatures.energy?.mean || 0) * 1000), unit: "mW" },
        { name: "Speed", value: Math.round(latest.voiceFeatures.speakingRate || 0), unit: "syl/s" },
        { name: "Pauses", value: Math.round((latest.voiceFeatures.pauseFrequency || 0) * 100), unit: "%" },
      ]
    : [
        { name: "Pitch", value: 142, unit: "Hz" },
        { name: "Energy", value: 60, unit: "mW" },
        { name: "Speed", value: 3, unit: "syl/s" },
        { name: "Pauses", value: 28, unit: "%" },
      ];

  const wellnessRadial = [
    { name: "score", value: stats.moodScore, fill: "#00f0ff" },
  ];

  // Emotion hexagon radar data (6 factors)
  const emotionRadarData = latest?.emotions?.distribution
    ? [
        { emotion: "Happy", value: Math.round((latest.emotions.distribution.happy || 0) * 100) },
        { emotion: "Sad", value: Math.round((latest.emotions.distribution.sad || 0) * 100) },
        { emotion: "Fear", value: Math.round((latest.emotions.distribution.fearful || 0) * 100) },
        { emotion: "Disgust", value: Math.round((latest.emotions.distribution.disgust || 0) * 100) },
        { emotion: "Anger", value: Math.round((latest.emotions.distribution.angry || 0) * 100) },
        { emotion: "Surprise", value: Math.round((latest.emotions.distribution.surprise || 0) * 100) },
      ]
    : [
        { emotion: "Happy", value: 65 },
        { emotion: "Sad", value: 15 },
        { emotion: "Fear", value: 20 },
        { emotion: "Disgust", value: 8 },
        { emotion: "Anger", value: 12 },
        { emotion: "Surprise", value: 35 },
      ];

  return (
    <div className="relative min-h-screen text-slate-100 font-sans select-none overflow-x-hidden" style={{ backgroundColor: "#050510" }}>
      <ParticleBackground />

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full glass-panel">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              &larr; Home
            </Link>
            <div className="w-[1px] h-4 bg-slate-800" />
            <span className="text-sm font-bold text-neon-gradient">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/voice"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-950/20 text-xs font-semibold text-purple-300 hover:border-purple-500/50 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              New Check-In
            </Link>
            <Link
              href="/settings"
              className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center font-bold text-xs text-slate-300 hover:border-slate-600 transition-colors"
            >
              VM
            </Link>
          </div>
        </nav>
      </header>

      {/* Dashboard Content */}
      <main className="w-full max-w-7xl mx-auto px-6 py-6 relative z-10 flex flex-col gap-6">

        {/* ROW 1: Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Wellness Score */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-2">
            <div className="w-20 h-20 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={wellnessRadial} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-extrabold text-cyan-400">{stats.moodScore}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Wellness</span>
          </div>

          {/* Stress */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Stress</span>
            <span className="text-3xl font-extrabold text-slate-100">{stats.stressLevel}<span className="text-sm text-slate-500">%</span></span>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-rose-500 transition-all duration-700" style={{ width: `${stats.stressLevel}%` }} />
            </div>
            <span className="text-[9px] text-slate-500">{stats.stressLevel < 30 ? "Low" : stats.stressLevel < 60 ? "Moderate" : "High"}</span>
          </div>

          {/* Sessions */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Sessions</span>
            <span className="text-3xl font-extrabold text-slate-100">{stats.totalSessions}</span>
            <span className="text-[9px] text-slate-500">Total recordings</span>
          </div>

          {/* Energy */}
          <div className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Energy</span>
            <span className="text-3xl font-extrabold text-slate-100">{stats.energyLevel}<span className="text-sm text-slate-500">%</span></span>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700" style={{ width: `${stats.energyLevel}%` }} />
            </div>
            <span className="text-[9px] text-slate-500">{stats.energyLevel > 70 ? "High" : stats.energyLevel > 40 ? "Normal" : "Low"}</span>
          </div>
        </div>

        {/* ROW 2: Mood Trend Chart + Orb */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Trend - Takes 2 cols */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Mood & Stress Trend</h3>
                <p className="text-[10px] text-slate-500">Last {moodTrendData.length} sessions</p>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" />Mood</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" />Stress</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" />Energy</span>
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="session" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0a0a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Area type="monotone" dataKey="mood" stroke="#00f0ff" fill="url(#moodGrad)" strokeWidth={2} dot={{ r: 3, fill: "#00f0ff" }} />
                  <Area type="monotone" dataKey="stress" stroke="#f43f5e" fill="url(#stressGrad)" strokeWidth={2} dot={{ r: 3, fill: "#f43f5e" }} />
                  <Area type="monotone" dataKey="energy" stroke="#a855f7" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Emotional Orb - Contained in fixed-size card */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-between overflow-hidden">
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-200">Emotional State</h3>
              <p className="text-[10px] text-slate-500 mt-1 capitalize">
                {latest?.emotions?.primary || latest?.aiInsights?.emotionalState || (stats.totalSessions > 0 ? "Calm" : "Analyzing...")}
              </p>
            </div>
            <div className="w-full h-[160px] relative flex-shrink-0">
              <EmotionalOrb
                emotion={mapEmotionToType(latest?.emotions?.primary || latest?.aiInsights?.emotionalState)}
                interactive={false}
              />
            </div>
            <div className="text-center">
              <span className="text-lg font-extrabold text-cyan-400">{stats.moodScore}</span>
              <span className="text-xs text-slate-500">/100</span>
              <p className="text-[9px] text-slate-500 mt-1">Wellness Score</p>
            </div>
          </div>
        </div>

        {/* ROW 3: Emotion Radar + Voice Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emotion Hexagon Radar */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-1">Emotion Spectrum</h3>
            <p className="text-[10px] text-slate-500 mb-4">6-factor emotional distribution from voice analysis</p>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={emotionRadarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="emotion"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fontSize: 8, fill: "#475569" }}
                    axisLine={false}
                  />
                  <Radar
                    name="Emotion"
                    dataKey="value"
                    stroke="#00f0ff"
                    fill="#00f0ff"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0a0a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px" }}
                    formatter={(value: number) => [`${value}%`, "Intensity"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Voice Metrics */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-1">Voice Biomarkers</h3>
            <p className="text-[10px] text-slate-500 mb-4">Acoustic features from latest analysis</p>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={voiceMetrics} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0a0a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#7000ff" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ROW 4: Recent Sessions */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200">Recent Sessions</h3>
            <Link href="/voice/history" className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">
              View all &rarr;
            </Link>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto max-h-[250px]">
            {analyses.slice(0, 5).map((a) => {
              const emotion = mapEmotionToType(a.emotions?.primary);
              const score = Math.round((a.aiInsights?.sentimentScore || 5) * 10);
              const colors: Record<EmotionType, string> = {
                calm: "text-cyan-400",
                energetic: "text-pink-400",
                anxious: "text-purple-400",
                joyful: "text-yellow-400",
              };
              return (
                <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/30 border border-slate-900 hover:border-slate-800 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                      {a.audioFileName || "Voice Recording"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(a.createdAt).toLocaleDateString()} &middot; {a.emotions?.primary || "analyzing"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${colors[emotion]}`}>{score}/100</span>
                    <span className={`w-2 h-2 rounded-full ${score > 60 ? "bg-emerald-400" : score > 40 ? "bg-amber-400" : "bg-rose-400"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ROW 4: Quick Action */}
        <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Ready for your next check-in?</h3>
            <p className="text-[10px] text-slate-500 mt-1">Record a 30-second voice sample to update your wellness metrics.</p>
          </div>
          <Link
            href="/voice"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs hover:brightness-110 shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all duration-300 whitespace-nowrap"
          >
            Start Voice Check-In
          </Link>
        </div>

      </main>
    </div>
  );
}
