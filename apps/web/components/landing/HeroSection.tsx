"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          AI-Powered Voice Biomarker Analysis
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-tight tracking-tight"
        >
          <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
            Your Voice Can Reveal
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            What Words Hide.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered emotional wellness tracking through voice biomarker
          analysis. Detect stress, anxiety, and depression from vocal patterns
          in seconds.
        </motion.p>


        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-2xl shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
          >
            Start Analyzing Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 transition">
            <Play className="w-4 h-4" />
            Watch Demo
          </button>
        </motion.div>

        {/* Glowing orb decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20 relative mx-auto w-full max-w-3xl"
        >
          {/* Waveform visualization mockup */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/5 to-transparent" />
            <div className="flex items-center justify-center gap-[3px] h-24">
              {Array.from({ length: 60 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full bg-gradient-to-t from-purple-500 to-cyan-400"
                  initial={{ height: "20%" }}
                  animate={{
                    height: `${20 + Math.sin(i * 0.3) * 40 + Math.random() * 30}%`,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.02,
                  }}
                />
              ))}
            </div>
            <p className="text-center text-xs text-white/30 mt-4">
              Real-time voice biomarker extraction
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
