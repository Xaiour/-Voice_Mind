"use client";

import { motion } from "framer-motion";
import { LucideIcon, Mic, MessageSquare, BarChart3, FileAudio } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

interface EmptyStateProps {
  variant: "dashboard" | "history" | "chat" | "voice";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// ─── Presets ────────────────────────────────────────────────

const PRESETS: Record<
  EmptyStateProps["variant"],
  { icon: LucideIcon; title: string; description: string; actionLabel: string; color: string }
> = {
  dashboard: {
    icon: BarChart3,
    title: "Your wellness story starts here",
    description:
      "Record your first voice check-in to begin tracking emotional patterns. VoiceMind learns more about you with each session.",
    actionLabel: "Start First Check-In",
    color: "purple",
  },
  history: {
    icon: FileAudio,
    title: "No analyses yet",
    description:
      "Your voice analysis history will appear here. Each recording reveals emotional biomarkers that help you understand yourself better.",
    actionLabel: "Record Now",
    color: "cyan",
  },
  chat: {
    icon: MessageSquare,
    title: "Start a conversation",
    description:
      "Your wellness companion is ready to listen. Share how you're feeling — there's no judgment here, only support.",
    actionLabel: "Say Hello",
    color: "pink",
  },
  voice: {
    icon: Mic,
    title: "Ready when you are",
    description:
      "Take a moment. When you're ready, tap record and speak naturally for 30 seconds. Your voice carries more than words.",
    actionLabel: "Begin Recording",
    color: "amber",
  },
};

// ─── Component ──────────────────────────────────────────────

export function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const preset = PRESETS[variant];
  const Icon = preset.icon;

  const colorMap: Record<string, { icon: string; glow: string; btn: string }> = {
    purple: {
      icon: "text-purple-400",
      glow: "bg-purple-500/10",
      btn: "from-purple-600 to-purple-500",
    },
    cyan: {
      icon: "text-cyan-400",
      glow: "bg-cyan-500/10",
      btn: "from-cyan-600 to-cyan-500",
    },
    pink: {
      icon: "text-pink-400",
      glow: "bg-pink-500/10",
      btn: "from-pink-600 to-pink-500",
    },
    amber: {
      icon: "text-amber-400",
      glow: "bg-amber-500/10",
      btn: "from-amber-600 to-amber-500",
    },
  };

  const colors = colorMap[preset.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Icon with glow */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="relative mb-6"
      >
        <div className={`absolute inset-0 ${colors.glow} rounded-full blur-2xl scale-150 animate-pulse`} />
        <div className="relative w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center backdrop-blur-sm">
          <Icon className={`w-7 h-7 ${colors.icon}`} />
        </div>
      </motion.div>

      {/* Text */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-semibold text-white/80 mb-2"
      >
        {title || preset.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-white/30 max-w-sm leading-relaxed mb-8"
      >
        {description || preset.description}
      </motion.p>

      {/* Action button */}
      {onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className={`px-6 py-3 rounded-xl bg-gradient-to-r ${colors.btn} text-white text-sm font-medium shadow-lg transition-shadow hover:shadow-xl`}
        >
          {actionLabel || preset.actionLabel}
        </motion.button>
      )}

      {/* Decorative dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-1.5 mt-10"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-white/10"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
