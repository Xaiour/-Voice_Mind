"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Waves, Brain, Activity } from "lucide-react";

export function VoiceAnalysisSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              How Voice Reveals Emotion
            </span>
          </h2>
          <p className="mt-4 text-white/40 max-w-xl mx-auto">
            Your voice carries invisible biomarkers — micro-patterns in pitch,
            rhythm, and energy that reveal your emotional state.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Waves,
              title: "Voice Capture",
              desc: "Record or upload audio. Our system accepts any format and preprocesses for optimal analysis.",
              gradient: "from-purple-500 to-purple-700",
              glow: "purple",
            },
            {
              icon: Activity,
              title: "Biomarker Extraction",
              desc: "We extract pitch, jitter, energy, speech rate, pause patterns, and 13 MFCC coefficients.",
              gradient: "from-cyan-500 to-blue-600",
              glow: "cyan",
            },
            {
              icon: Brain,
              title: "AI Emotional Analysis",
              desc: "Our ML pipeline scores stress, anxiety, and depression with clinical-grade confidence.",
              gradient: "from-pink-500 to-rose-600",
              glow: "pink",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="group relative p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all hover:bg-white/[0.04]"
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-${item.glow}-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
