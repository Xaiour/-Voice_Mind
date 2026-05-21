"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mic, Cpu, BarChart3, Shield } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Mic,
    title: "Record or Upload",
    desc: "Capture a voice session directly in-app or upload an existing audio file (WAV, MP3, OGG).",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI Processes",
    desc: "Our Python microservice extracts 7+ vocal biomarkers using librosa and clinical ML models.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Get Insights",
    desc: "Receive emotional scores (stress, anxiety, depression) with confidence levels and clinical notes.",
  },
  {
    step: "04",
    icon: Shield,
    title: "Track Over Time",
    desc: "Monitor emotional trends across sessions. Get alerts when risk indicators change.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" ref={ref} className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="mt-4 text-white/40 max-w-md mx-auto">
            From audio to actionable insights in under 30 seconds.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-cyan-500/30 to-transparent hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                className="flex gap-6 items-start"
              >

                {/* Step circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm flex items-center justify-center group-hover:border-purple-500/30 transition">
                    <step.icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-mono text-purple-400/60 bg-[#0a0a0f] px-1">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm text-white/40 max-w-md leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
