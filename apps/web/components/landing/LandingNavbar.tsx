"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function LandingNavbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-[#0a0a0f]/70"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Brain className="h-7 w-7 text-purple-400 group-hover:text-purple-300 transition" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md group-hover:bg-purple-300/30 transition" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            VoiceMind
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 transition font-medium shadow-lg shadow-purple-500/20"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
