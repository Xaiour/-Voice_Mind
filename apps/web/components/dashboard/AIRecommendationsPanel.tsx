"use client";

import { GlassCard } from "./GlassCard";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Brain, Moon, Dumbbell, MessageSquare } from "lucide-react";

const RECOMMENDATIONS = [
  {
    id: 1,
    icon: Moon,
    title: "Improve Sleep Routine",
    description: "Your voice patterns show fatigue markers. Consider a consistent 10pm bedtime.",
    priority: "high" as const,
    color: "purple",
  },
  {
    id: 2,
    icon: Dumbbell,
    title: "Morning Exercise",
    description: "Physical activity before 9am could reduce your stress score by 15-20%.",
    priority: "medium" as const,
    color: "cyan",
  },
  {
    id: 3,
    icon: Brain,
    title: "Mindfulness Practice",
    description: "5-minute breathing exercises between sessions can stabilize vocal patterns.",
    priority: "medium" as const,
    color: "emerald",
  },
  {
    id: 4,
    icon: MessageSquare,
    title: "Journaling",
    description: "Expressive writing correlates with reduced anxiety markers in follow-up sessions.",
    priority: "low" as const,
    color: "amber",
  },
];

const priorityBadge = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export function AIRecommendationsPanel() {
  return (
    <GlassCard glow="pink" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-[60px]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              AI Recommendations
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
            Powered by GPT-4o
          </span>
        </div>

        {/* Recommendation List */}
        <div className="space-y-3">
          {RECOMMENDATIONS.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              whileHover={{ x: 4 }}
              className="group flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                <rec.icon className="w-4 h-4 text-white/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-white/80 truncate">{rec.title}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${priorityBadge[rec.priority]}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-white/35 leading-relaxed line-clamp-2">
                  {rec.description}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition mt-1 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
