"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FloatingCard } from "@/components/three-d";
import { ParallaxContainer } from "@/components/three-d";
import { ParticleBackground } from "@/components/three-d";

// Dynamic imports for heavy Three.js components (no SSR)
const HeroScene = dynamic(() => import("@/components/three-d/HeroScene"), { ssr: false });
const SoundWaveMesh = dynamic(() => import("@/components/three-d/SoundWaveMesh"), { ssr: false });
const EmotionalOrb = dynamic(() => import("@/components/three-d/EmotionalOrb"), { ssr: false });

type EmotionType = "calm" | "energetic" | "anxious" | "joyful";

export default function Home() {
  const [activeEmotion, setActiveEmotion] = useState<EmotionType>("calm");

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* 3D Particle Background */}
      <ParticleBackground />

      {/* Floating Header */}
      <header className="sticky top-0 z-50 w-full px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full glass-panel">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-pulse glow-text-cyan" />
            <Link href="/" className="text-xl font-bold tracking-tight text-neon-gradient">
              VoiceMind
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#acoustic" className="hover:text-purple-400 transition-colors">Acoustic Web</a>
            <a href="#spectrum" className="hover:text-pink-400 transition-colors">Spectrum AI</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-xs font-semibold rounded-full bg-slate-900 border border-slate-700/60 text-slate-200 hover:text-cyan-400 hover:border-cyan-400/50 shadow-sm transition-all duration-300 relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-28 relative z-10">

        {/* HERO SECTION */}
        <section className="min-h-[80vh] flex flex-col md:flex-row items-center justify-between gap-12 pt-8">
          <div className="flex-1 flex flex-col gap-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 self-center md:self-start px-3.5 py-1.5 rounded-full bg-purple-950/30 border border-purple-500/20 text-xs font-medium text-purple-300 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              Next-Gen Cognitive Acoustic UI
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-neon-gradient">
              AI that <br />
              understands <br />
              your vibe.
            </h1>

            <p className="max-w-lg text-lg text-slate-400 font-normal leading-relaxed mx-auto md:mx-0">
              Decode your mental frequencies. VoiceMind is a floating anti-gravity voice diary that tracks, morphs, and helps you master your emotional energy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4">
              <Link
                href="/register"
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 font-semibold text-sm hover:brightness-110 shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all duration-300 text-center"
              >
                Start Free Now
              </Link>
              <a
                href="#features"
                className="px-8 py-3.5 rounded-full border border-slate-700/80 bg-slate-950/40 backdrop-blur-md font-semibold text-sm hover:border-slate-500 transition-all duration-300 text-center"
              >
                Explore Features
              </a>
            </div>
          </div>

          <div className="flex-1 w-full h-[450px] md:h-[550px] relative">
            <HeroScene />
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="flex flex-col gap-12 scroll-mt-24">
          <div className="text-center flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Anti-Gravity Technology
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              Hover and tilt the modules to feel the 3D depth field dynamics. Built with state-of-the-art interactive mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FloatingCard glowColor="cyan" floatDelay={0} className="flex flex-col gap-4 h-[280px] justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/25 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  01
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  Neural Mapping
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Deep neural networks extract acoustic properties to graph vocal tone fluctuations and sub-sensory shifts.
                </p>
              </div>
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                Acoustic Analysis &rarr;
              </span>
            </FloatingCard>

            <FloatingCard glowColor="purple" floatDelay={1.5} className="flex flex-col gap-4 h-[280px] justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-center justify-center text-purple-400 font-bold text-lg">
                  02
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  Dynamic Waveforms
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Animate and deform volumetric sound waves directly linked to your device&apos;s recording feed.
                </p>
              </div>
              <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
                Realtime Deformers &rarr;
              </span>
            </FloatingCard>

            <FloatingCard glowColor="pink" floatDelay={3.0} className="flex flex-col gap-4 h-[280px] justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-950/40 border border-pink-500/25 flex items-center justify-center text-pink-400 font-bold text-lg">
                  03
                </div>
                <h3 className="text-xl font-bold text-slate-100">
                  Emotional Spectrum
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Shape-shifting core liquid materials transform state and color to represent anxiety, calmness, or joy.
                </p>
              </div>
              <span className="text-xs text-pink-400 font-semibold uppercase tracking-wider">
                Interactive Orbs &rarr;
              </span>
            </FloatingCard>
          </div>
        </section>

        {/* ACOUSTIC DIMENSION SECTION */}
        <section id="acoustic" className="flex flex-col md:flex-row items-center gap-12 bg-slate-950/30 border border-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden scroll-mt-24">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/5 via-transparent to-transparent pointer-events-none" />

          <div className="flex-1 flex flex-col gap-6 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Interactive <br />
              <span className="text-purple-400 glow-text-purple">Acoustic Web</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-md">
              Move your mouse cursor across the canvas plane to morph the 3D grid. The volumetric waveform deforms dynamically, replicating the physical weight of vocal frequencies.
            </p>
            <div className="flex items-center gap-4 text-sm font-semibold text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              Reactive Mesh Mode Enabled
            </div>
          </div>

          <div className="flex-1 w-full h-[350px] relative bg-slate-950/20 rounded-2xl border border-slate-900">
            <SoundWaveMesh />
          </div>
        </section>

        {/* EMOTIONAL SPECTRAL ORB SECTION */}
        <section id="spectrum" className="flex flex-col md:flex-row-reverse items-center gap-12 scroll-mt-24">
          <div className="flex-1 flex flex-col gap-6 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Spectral <br />
              <span className="text-pink-400 glow-text-pink">Emotional Orb</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Experience the liquid morphing material mechanics. Choose different mood profiles below to see the 3D particle core deform, wiggling and pulsing in full neon glory.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {(["calm", "energetic", "anxious", "joyful"] as EmotionType[]).map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => setActiveEmotion(emotion)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs capitalize transition-all duration-300 border ${
                    activeEmotion === emotion
                      ? "bg-slate-100 text-slate-950 border-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full h-[320px] md:h-[400px] relative flex items-center justify-center">
            <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 blur-3xl -z-10" />
            <EmotionalOrb emotion={activeEmotion} interactive={true} />
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="text-center flex flex-col gap-8 items-center bg-gradient-to-tr from-cyan-950/10 via-purple-950/10 to-pink-950/10 border border-slate-800/60 rounded-3xl p-12 relative overflow-hidden">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Ready to chart your energy?
          </h2>
          <p className="text-slate-400 max-w-md text-sm md:text-base leading-relaxed">
            Join the cohort mapping their frequencies in 3D. Launch the dashboard, activate the microphone, and begin recording your cognitive logs.
          </p>
          <Link
            href="/register"
            className="px-10 py-4 rounded-full bg-slate-100 text-slate-950 font-bold text-sm hover:bg-slate-200 shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all duration-300"
          >
            Launch Free Dashboard
          </Link>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-900 py-10 px-6 mt-16" style={{ backgroundColor: "#050510" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-purple/40" />
            <span>VoiceMind &copy; 2026. Made with anti-gravity.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Use</a>
            <a href="#" className="hover:text-slate-300">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
