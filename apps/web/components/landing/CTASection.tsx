"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-[#12121a] to-cyan-900/30" />
          <div className="absolute inset-0 border border-white/10 rounded-3xl" />

          {/* Decorative glows */}
          <div className="absolute top-0 left-1/3 w-64 h-32 bg-purple-500/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-48 h-24 bg-cyan-500/15 rounded-full blur-[60px]" />

          {/* Content */}
          <div className="relative p-12 md:p-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
                <Sparkles className="w-3 h-3" />
                Free for clinicians
              </div>

              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                  Ready to Listen Deeper?
                </span>
              </h2>

              <p className="mt-4 text-white/40 max-w-lg mx-auto">
                Join 2,000+ mental health professionals using AI voice analysis
                to provide better patient care.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold shadow-2xl shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-xs text-white/30">
                  No credit card required. 14-day trial.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
