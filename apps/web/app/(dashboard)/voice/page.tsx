"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { VoiceCheckIn } from "@/components/voice/VoiceCheckIn";

const ParticleBackground = dynamic(
  () => import("@/components/three-d/ParticleBackground"),
  { ssr: false }
);

export default function VoicePage() {
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#050510" }}>
      <ParticleBackground />

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full glass-panel">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              &larr; Dashboard
            </Link>
            <div className="w-[1px] h-4 bg-slate-800" />
            <span className="text-sm font-bold text-neon-gradient">
              Voice Check-In
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-[10px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Core Online
          </div>
        </nav>
      </header>

      <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-10">
        <VoiceCheckIn />
      </div>
    </div>
  );
}
