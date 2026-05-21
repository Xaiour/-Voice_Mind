"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(
  () => import("@/components/three-d/ParticleBackground"),
  { ssr: false }
);

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex relative" style={{ backgroundColor: "#050510" }}>
      <ParticleBackground />

      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative z-10">
        <div className="max-w-md text-center flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-3xl font-bold text-neon-gradient">VoiceMind</span>
          </div>
          <p className="text-slate-400 text-base leading-relaxed">
            AI-powered voice analysis for emotional wellness. Decode your mental frequencies with next-gen cognitive acoustic technology.
          </p>
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
          >
            &larr; Back to landing page
          </Link>
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
