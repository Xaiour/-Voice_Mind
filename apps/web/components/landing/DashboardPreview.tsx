"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function DashboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            A Dashboard Built for Clinicians
          </h2>
          <p className="mt-4 text-white/40 max-w-lg mx-auto">
            Track emotional trends, view session history, and get AI-powered
            insights — all in one place.
          </p>
        </motion.div>

        {/* Floating Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 8 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative perspective-1000"
        >
          {/* Outer glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-cyan-500/10 to-purple-600/20 rounded-3xl blur-2xl opacity-60" />

          {/* Dashboard frame */}
          <div className="relative rounded-2xl border border-white/10 bg-[#12121a]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Titlebar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-4 text-xs text-white/30">VoiceMind Dashboard</span>
            </div>

            {/* Dashboard content */}
            <div className="p-6 grid grid-cols-12 gap-4">
              {/* Sidebar mock */}
              <div className="col-span-2 space-y-3 hidden md:block">
                {["Dashboard", "Voice", "History", "AI Chat", "Settings"].map((item, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-lg text-xs ${
                      i === 0 ? "bg-purple-500/20 text-purple-300" : "text-white/30"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>


              {/* Main content */}
              <div className="col-span-12 md:col-span-10 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Sessions", value: "47", color: "purple" },
                    { label: "Avg Sentiment", value: "6.8", color: "cyan" },
                    { label: "Stress Level", value: "Low", color: "green" },
                    { label: "Alerts", value: "2", color: "amber" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="p-3 rounded-lg border border-white/5 bg-white/[0.02]"
                    >
                      <p className="text-[10px] text-white/30 uppercase">{stat.label}</p>
                      <p className="text-lg font-bold text-white mt-0.5">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Chart area mock */}
                <div className="h-32 rounded-xl border border-white/5 bg-white/[0.01] flex items-end justify-around px-4 pb-4">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-4 rounded-t-sm bg-gradient-to-t from-purple-600/60 to-cyan-400/60"
                      initial={{ height: 0 }}
                      animate={isInView ? { height: `${30 + Math.sin(i * 0.8) * 40 + Math.random() * 20}%` } : {}}
                      transition={{ duration: 0.8, delay: 0.7 + i * 0.05 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
