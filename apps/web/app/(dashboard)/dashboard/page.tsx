"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDashboardData } from "@/hooks/useDashboardData";
import { FloatingCard } from "@/components/three-d";
import { ParticleBackground } from "@/components/three-d";

// Dynamic imports for heavy Three.js components
const EmotionalOrb = dynamic(() => import("@/components/three-d/EmotionalOrb"), { ssr: false });
const WaveformVisualizer = dynamic(() => import("@/components/three-d/WaveformVisualizer"), { ssr: false });

type EmotionType = "calm" | "energetic" | "anxious" | "joyful";

interface VoiceLog {
  id: string;
  title: string;
  emotion: EmotionType;
  duration: string;
  time: string;
  vibeScore: number;
}

const emotionInsights: Record<EmotionType, { text: string; details: string; color: string }> = {
  calm: {
    text: "Resonance matches Alpha brain rhythms (8.5Hz). Low acoustic jitter.",
    details: "Your vocal pattern suggests high clarity, low stress, and deep physical stability.",
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20",
  },
  energetic: {
    text: "High velocity speaking rate. Micro-pitch peaks positive.",
    details: "Your vocal frequency is accelerated, showing high enthusiasm, speed, and creative focus.",
    color: "text-pink-400 border-pink-500/20 bg-pink-950/20",
  },
  anxious: {
    text: "Irregular wave intervals. Vocal pitch show micro-tremors.",
    details: "Your resonance pattern indicates elevated cortisol signatures. Try 4-7-8 breathing exercises.",
    color: "text-purple-400 border-purple-500/20 bg-purple-950/20",
  },
  joyful: {
    text: "Perfect harmonic stability. Peak resonant amplification.",
    details: "Acoustic signatures show high emotional variance paired with strong wave coherence.",
    color: "text-yellow-400 border-yellow-500/20 bg-yellow-950/20",
  },
};

function mapEmotionToType(emotion: string | undefined): EmotionType {
  if (!emotion) return "calm";
  const lower = emotion.toLowerCase();
  if (lower.includes("happy") || lower.includes("joy") || lower.includes("positive")) return "joyful";
  if (lower.includes("energy") || lower.includes("energetic") || lower.includes("excited")) return "energetic";
  if (lower.includes("anxious") || lower.includes("fear") || lower.includes("stress") || lower.includes("tense")) return "anxious";
  return "calm";
}

export default function DashboardPage() {
  const { analyses, latest, isLoading, stats } = useDashboardData();
  const [activeEmotion, setActiveEmotion] = useState<EmotionType>("calm");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [avgAudioVolume, setAvgAudioVolume] = useState(0);

  // Derive emotion from latest analysis
  useEffect(() => {
    if (latest?.emotions?.primary) {
      setActiveEmotion(mapEmotionToType(latest.emotions.primary));
    }
  }, [latest]);

  // Build voice logs from real data
  const voiceLogs: VoiceLog[] = analyses
    .filter((a) => a.status === "completed")
    .slice(0, 5)
    .map((a) => ({
      id: a._id,
      title: a.audioFileName || "Voice Entry.wav",
      emotion: mapEmotionToType(a.emotions?.primary),
      duration: a.voiceFeatures?.speakingRate
        ? `${Math.round(a.voiceFeatures.speakingRate)}s`
        : "0:30",
      time: new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      vibeScore: Math.round((a.aiInsights?.sentimentScore || 5) * 10),
    }));

  // Timer logic for recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Redirect to voice check-in for proper upload flow
      window.location.href = "/voice";
    } else {
      setIsRecording(true);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleAudioData = (volume: number) => {
    setAvgAudioVolume(volume);
  };

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

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* 3D Particle Background */}
      <ParticleBackground />

      {/* Navigation Header */}
      <header className="w-full px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full glass-panel">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              &larr; Home
            </Link>
            <div className="w-[1px] h-4 bg-slate-800" />
            <span className="text-sm font-bold bg-neon-gradient text-transparent bg-clip-text">
              Dashboard / Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/voice"
              className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-950/20 text-[10px] font-semibold text-purple-300 hover:border-purple-500/40 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Voice Check-In
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Core Online
            </div>
            <Link
              href="/settings"
              className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center font-bold text-xs text-slate-300 hover:border-slate-600 transition-colors"
            >
              VM
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Dashboard Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* LEFT COLUMN: 3D Orb & Selector */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <FloatingCard
            glowColor={
              activeEmotion === "calm"
                ? "cyan"
                : activeEmotion === "energetic"
                ? "pink"
                : activeEmotion === "anxious"
                ? "purple"
                : "cyan"
            }
            floatDelay={0}
            className="flex-1 flex flex-col justify-between h-[450px]"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold text-slate-200">
                Cognitive Resonance Orb
              </h2>
              <p className="text-slate-500 text-xs">
                {stats.totalSessions > 0
                  ? `Based on ${stats.totalSessions} sessions analyzed`
                  : "Shows active neural signature deforming volumetric shapes."}
              </p>
            </div>

            {/* 3D Orb Canvas */}
            <div className="flex-1 min-h-[220px] relative flex items-center justify-center">
              <div
                className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 blur-3xl transition-transform duration-100"
                style={{
                  transform: `scale(${1 + avgAudioVolume * 1.5})`,
                }}
              />
              <EmotionalOrb emotion={activeEmotion} interactive={true} />
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-4 gap-2">
              {(["calm", "energetic", "anxious", "joyful"] as EmotionType[]).map((emo) => (
                <button
                  key={emo}
                  onClick={() => setActiveEmotion(emo)}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
                    activeEmotion === emo
                      ? "bg-slate-100 border-slate-100 text-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>
          </FloatingCard>

          {/* Neuro Diagnostics Card */}
          <FloatingCard floatDelay={1.0} className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-300">
              Acoustic Resonance Insights
            </h3>
            <div className={`p-4 border rounded-2xl ${emotionInsights[activeEmotion].color} transition-all duration-300`}>
              <p className="text-xs font-semibold leading-normal">
                {emotionInsights[activeEmotion].text}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {emotionInsights[activeEmotion].details}
            </p>
          </FloatingCard>
        </section>

        {/* RIGHT COLUMN: Recorder & Cards */}
        <section className="lg:col-span-7 flex flex-col gap-6">

          {/* Volumetric Waveform Recorder Card */}
          <FloatingCard glowColor={isRecording ? "pink" : "none"} floatDelay={0.5} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-200">Volumetric Voice Recorder</h2>
                <p className="text-slate-500 text-xs">
                  Speak to deform the 3D frequency mesh grid.
                </p>
              </div>

              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  REC {formatTime(recordingSeconds)}
                </div>
              )}
            </div>

            {/* 3D Waveform Canvas */}
            <div className="h-[220px] bg-slate-950/30 rounded-2xl border border-slate-900 relative overflow-hidden flex items-center justify-center">
              <WaveformVisualizer isRecording={isRecording} onAudioData={handleAudioData} />
            </div>

            {/* Control Panel */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-2">
              <span className="text-[11px] text-slate-400">
                {isRecording ? "Listening to microphone input..." : "Click record to analyze vocal resonance."}
              </span>

              <div className="flex gap-3">
                <Link
                  href="/voice"
                  className="px-6 py-3 rounded-full font-bold text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all duration-300"
                >
                  Full Check-In
                </Link>
                <button
                  onClick={toggleRecording}
                  className={`px-8 py-3 rounded-full font-bold text-xs transition-all duration-300 shadow-md ${
                    isRecording
                      ? "bg-rose-500 text-slate-100 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                      : "bg-slate-100 text-slate-950 hover:bg-slate-200 shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                  }`}
                >
                  {isRecording ? "Stop & Analyze" : "Quick Record"}
                </button>
              </div>
            </div>
          </FloatingCard>

          {/* Grid Panel for secondary data elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Stats Dashboard Card - Connected to real data */}
            <FloatingCard floatDelay={1.5} className="flex flex-col gap-4 justify-between h-[230px]">
              <h3 className="text-sm font-bold text-slate-300">Live Coherence Index</h3>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-100 tracking-tight">
                  {stats.totalSessions > 0 ? stats.moodScore : "--"}
                </span>
                <span className="text-xs text-cyan-400 font-bold">
                  {stats.totalSessions > 0 ? "/100" : ""}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>STRESS LEVEL</span>
                  <span>
                    {stats.totalSessions > 0
                      ? `${stats.stressLevel}% (${stats.stressLevel < 30 ? "LOW" : stats.stressLevel < 60 ? "MODERATE" : "HIGH"})`
                      : "NO DATA"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                    style={{ width: `${stats.stressLevel || 0}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between border-t border-slate-900 pt-3 text-[10px] text-slate-400">
                <div>
                  <div className="font-bold text-slate-300">{stats.totalSessions}</div>
                  <div>Sessions</div>
                </div>
                <div>
                  <div className="font-bold text-slate-300">{stats.avgSentiment}</div>
                  <div>Avg Mood</div>
                </div>
                <div>
                  <div className="font-bold text-slate-300">{stats.energyLevel}%</div>
                  <div>Energy</div>
                </div>
              </div>
            </FloatingCard>

            {/* Audio History Logs - Connected to real data */}
            <FloatingCard floatDelay={2.0} className="flex flex-col gap-3 justify-between h-[230px]">
              <h3 className="text-sm font-bold text-slate-300">Acoustic Diary Logs</h3>

              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
                {voiceLogs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                    <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center">
                      <span className="text-xs text-slate-600">&#127908;</span>
                    </div>
                    <p className="text-[11px] text-slate-500">No recordings yet</p>
                    <Link href="/voice" className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors">
                      Start your first check-in &rarr;
                    </Link>
                  </div>
                ) : (
                  voiceLogs.map((log) => {
                    const tagColors: Record<EmotionType, string> = {
                      calm: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                      energetic: "bg-pink-500/10 text-pink-400 border-pink-500/20",
                      anxious: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                      joyful: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                    };

                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/20 border border-slate-900 hover:border-slate-800 transition-colors"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-slate-200 truncate max-w-[130px]">
                            {log.title}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {log.time} &middot; {log.duration}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 border rounded-full text-[9px] font-extrabold uppercase tracking-wide ${tagColors[log.emotion]}`}>
                          {log.emotion}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {voiceLogs.length > 0 && (
                <Link
                  href="/voice/history"
                  className="text-[10px] text-center text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  View all recordings &rarr;
                </Link>
              )}
            </FloatingCard>

          </div>
        </section>

      </main>

      {/* Decorative orb */}
      <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-500/5 to-pink-500/5 blur-3xl -z-10" />
    </div>
  );
}
