"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Mic,
  Heart,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

type Step = "welcome" | "permissions" | "mood" | "ready";

interface OnboardingFlowProps {
  onComplete: () => void;
}

// ─── Mood Options ───────────────────────────────────────────

const MOODS = [
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😔", label: "Low", value: "low" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😫", label: "Stressed", value: "stressed" },
];

// ─── Component ──────────────────────────────────────────────

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [micGranted, setMicGranted] = useState(false);

  const steps: Step[] = ["welcome", "permissions", "mood", "ready"];
  const currentIndex = steps.indexOf(step);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    const next = steps[currentIndex + 1];
    if (next) setStep(next);
  };

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicGranted(true);
      setTimeout(nextStep, 800);
    } catch {
      // Permission denied — allow skip
      setMicGranted(false);
      nextStep();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#07070c] flex items-center justify-center p-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-600/[0.07] rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 20, -30, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-500/[0.05] rounded-full blur-[120px]"
        />
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/[0.03]">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Welcome ─────────────────────────── */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              {/* Logo animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="relative mx-auto w-20 h-20"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 opacity-20 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                    Welcome to VoiceMind
                  </span>
                </h1>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                  Your AI-powered companion for emotional wellness. We analyze
                  voice biomarkers to help you understand your emotional state.
                </p>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 text-white/20">
                <div className="flex items-center gap-1.5 text-xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>HIPAA Ready</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Science-Based</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                className="group flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <p className="text-[10px] text-white/15">
                Takes less than 60 seconds to set up
              </p>
            </motion.div>
          )}

          {/* ─── STEP 2: Permissions ─────────────────────── */}
          {step === "permissions" && (
            <motion.div
              key="permissions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"
              >
                <Mic className="w-8 h-8 text-purple-400" />
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white/90">
                  Enable Microphone
                </h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                  VoiceMind needs microphone access to analyze your voice
                  patterns. Your audio is processed securely and never stored
                  without your consent.
                </p>
              </div>

              {/* Permission status */}
              <AnimatePresence>
                {micGranted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-emerald-400 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Microphone access granted
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={requestMicPermission}
                  disabled={micGranted}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-xl shadow-purple-500/20 disabled:opacity-50 transition-all"
                >
                  {micGranted ? "Granted ✓" : "Allow Microphone Access"}
                </motion.button>

                <button
                  onClick={nextStep}
                  className="w-full py-3 rounded-xl text-sm text-white/30 hover:text-white/50 transition"
                >
                  Skip for now
                </button>
              </div>

              {/* Privacy note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <Shield className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-white/20 text-left leading-relaxed">
                  Audio is processed locally on our secure servers. We never share
                  your voice data with third parties. You can delete your data at
                  any time.
                </p>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: Mood Baseline ───────────────────── */}
          {step === "mood" && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
                className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"
              >
                <Heart className="w-8 h-8 text-amber-400" />
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white/90">
                  How are you feeling?
                </h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                  This helps us personalize your experience. There's no right
                  or wrong answer.
                </p>
              </div>

              {/* Mood Grid */}
              <div className="grid grid-cols-3 gap-3">
                {MOODS.map((mood, i) => (
                  <motion.button
                    key={mood.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all
                      ${
                        selectedMood === mood.value
                          ? "border-purple-400/40 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                      }
                    `}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs text-white/50">{mood.label}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                disabled={!selectedMood}
                className="group w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-xl shadow-purple-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}

          {/* ─── STEP 4: Ready ───────────────────────────── */}
          {step === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-8"
            >
              {/* Success animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="relative mx-auto w-20 h-20"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white/90">
                  You're all set!
                </h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">
                  VoiceMind is ready to support your emotional wellness journey.
                  Start with a voice check-in or explore your dashboard.
                </p>
              </div>

              {/* Feature preview cards */}
              <div className="space-y-2">
                {[
                  { icon: Mic, text: "Record a voice check-in anytime", color: "purple" },
                  { icon: Brain, text: "Get AI-powered emotional insights", color: "cyan" },
                  { icon: Heart, text: "Track your wellness over time", color: "pink" },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.12 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-4 h-4 text-white/50" />
                    </div>
                    <span className="text-sm text-white/50">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onComplete}
                className="group w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
              >
                Enter VoiceMind
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                i <= currentIndex
                  ? "bg-gradient-to-r from-purple-500 to-cyan-500 w-6"
                  : "bg-white/10 w-1.5"
              }`}
              layout
            />
          ))}
        </div>
      </div>
    </div>
  );
}
