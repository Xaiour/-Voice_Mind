"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Mic, BarChart3, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">VoiceMind</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Understand Emotions{" "}
            <span className="text-primary">Through Voice</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered voice analysis for mental health professionals. Upload
            recordings, detect emotional patterns, and get clinical insights in
            seconds.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-lg font-medium hover:opacity-90 transition"
            >
              Start Free Trial
            </Link>
            <Link
              href="#features"
              className="px-6 py-3 border border-border rounded-lg text-lg font-medium hover:bg-accent transition"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          id="features"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              icon: Mic,
              title: "Voice Recording",
              desc: "Record or upload audio sessions with one click.",
            },
            {
              icon: Brain,
              title: "AI Analysis",
              desc: "GPT-4o powered emotional and clinical insights.",
            },
            {
              icon: BarChart3,
              title: "Trend Tracking",
              desc: "Monitor emotional patterns over time.",
            },
            {
              icon: Shield,
              title: "HIPAA Ready",
              desc: "Enterprise-grade security and privacy.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition"
            >
              <feature.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
