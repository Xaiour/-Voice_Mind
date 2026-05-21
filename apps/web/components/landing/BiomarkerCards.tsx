"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const biomarkers = [
  { label: "Pitch Analysis", value: "118 Hz", desc: "Fundamental frequency tracking", color: "purple" },
  { label: "Speech Rate", value: "2.8 syl/s", desc: "Syllables per second", color: "cyan" },
  { label: "Vocal Energy", value: "0.42 RMS", desc: "Root mean square amplitude", color: "pink" },
  { label: "Pause Ratio", value: "47%", desc: "Silence-to-speech proportion", color: "amber" },
  { label: "Jitter", value: "0.03", desc: "Pitch perturbation quotient", color: "emerald" },
  { label: "Stress Score", value: "72/100", desc: "AI-computed stress indicator", color: "red" },
];

export function BiomarkerCards() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Emotional Biomarkers We Track
          </h2>
          <p className="mt-4 text-white/40 max-w-lg mx-auto">
            Every voice session extracts 7+ biomarkers that paint a complete
            picture of emotional state.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {biomarkers.map((marker, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="relative group p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:border-white/[0.15] transition-all cursor-default"
            >
              {/* Glow dot */}
              <div className={`absolute top-5 right-5 w-2 h-2 rounded-full bg-${marker.color}-400 shadow-lg shadow-${marker.color}-400/50`} />

              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">
                {marker.label}
              </p>
              <p className="text-2xl font-bold text-white font-mono">
                {marker.value}
              </p>
              <p className="text-xs text-white/30 mt-2">{marker.desc}</p>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${marker.color}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
