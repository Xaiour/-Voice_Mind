"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(
  () => import("@/components/three-d/ParticleBackground"),
  { ssr: false }
);

interface AnalysisData {
  _id: string;
  status: string;
  audioFileName: string;
  createdAt: string;
  emotions?: { primary: string; confidence: number };
  aiInsights?: { sentimentScore: number; emotionalState: string };
  voiceFeatures?: { pitch?: { mean: number }; energy?: { mean: number }; speakingRate?: number };
}

export default function VoiceHistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const authData = localStorage.getItem("voicemind-auth");
      const userId = authData ? JSON.parse(authData)?.state?.userId : null;
      if (!userId) { setIsLoading(false); return; }

      const res = await fetch(`${API_URL}/voice/history?limit=50`, {
        headers: { "x-user-id": userId },
      });
      if (res.ok) {
        const json = await res.json();
        setAnalyses(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 font-sans" style={{ backgroundColor: "#050510" }}>
      <ParticleBackground />

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full glass-panel">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              &larr; Dashboard
            </Link>
            <div className="w-[1px] h-4 bg-slate-800" />
            <span className="text-sm font-bold text-neon-gradient">Voice History</span>
          </div>
          <Link
            href="/voice"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-950/20 text-xs font-semibold text-purple-300 hover:border-purple-500/50 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            New Check-In
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="w-full max-w-4xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-100">Analysis History</h1>
          <p className="text-sm text-slate-500 mt-1">All your past voice analysis results.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center text-2xl">
              🎙️
            </div>
            <p className="text-slate-400 text-sm">No recordings yet.</p>
            <Link href="/voice" className="text-xs text-purple-400 hover:text-purple-300 px-4 py-2 rounded-full border border-purple-500/30 transition-colors">
              Record your first check-in
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {analyses.map((a) => {
              const score = Math.round((a.aiInsights?.sentimentScore || 5) * 10);
              const emotion = a.emotions?.primary || a.aiInsights?.emotionalState || "analyzing";
              const date = new Date(a.createdAt);

              return (
                <div
                  key={a._id}
                  className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-slate-200">
                      {a.audioFileName || "Voice Recording"}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      a.status === "completed"
                        ? "border-emerald-500/20 bg-emerald-950/20 text-emerald-400"
                        : a.status === "failed"
                        ? "border-rose-500/20 bg-rose-950/20 text-rose-400"
                        : "border-amber-500/20 bg-amber-950/20 text-amber-400"
                    }`}>
                      {a.status}
                    </span>

                    <span className="text-xs text-slate-400 capitalize">{emotion}</span>

                    <span className={`text-sm font-bold ${score > 60 ? "text-cyan-400" : score > 40 ? "text-amber-400" : "text-rose-400"}`}>
                      {score}/100
                    </span>

                    {a.voiceFeatures?.pitch?.mean && (
                      <span className="text-[10px] text-slate-600">
                        {Math.round(a.voiceFeatures.pitch.mean)}Hz
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
