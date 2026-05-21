"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "purple" | "cyan" | "pink" | "amber" | "green" | "red" | "none";
}

const glowColors = {
  purple: "hover:shadow-purple-500/10 hover:border-purple-500/20",
  cyan: "hover:shadow-cyan-500/10 hover:border-cyan-500/20",
  pink: "hover:shadow-pink-500/10 hover:border-pink-500/20",
  amber: "hover:shadow-amber-500/10 hover:border-amber-500/20",
  green: "hover:shadow-green-500/10 hover:border-green-500/20",
  red: "hover:shadow-red-500/10 hover:border-red-500/20",
  none: "",
};

export function GlassCard({
  children,
  className,
  hover = true,
  glow = "purple",
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-6",
        "shadow-xl shadow-black/5",
        hover && "transition-all duration-300 hover:bg-white/[0.04] hover:shadow-2xl",
        hover && glowColors[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
