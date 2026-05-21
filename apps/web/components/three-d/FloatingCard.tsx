"use client";

import React from "react";
import { motion } from "framer-motion";

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "pink" | "none";
  floatDelay?: number;
  floatDuration?: number;
  floatHeight?: number;
}

export default function FloatingCard({
  children,
  className = "",
  glowColor = "none",
  floatDelay = 0,
  floatDuration = 6,
  floatHeight = 10,
}: FloatingCardProps) {
  const glowClasses: Record<string, string> = {
    none: "glass-card",
    cyan: "glass-card",
    purple: "glass-card glass-card-purple",
    pink: "glass-card glass-card-pink",
  };

  return (
    <motion.div
      animate={{
        y: [0, -floatHeight, 0],
      }}
      transition={{
        duration: floatDuration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: floatDelay,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className={`relative rounded-2xl p-6 ${glowClasses[glowColor]} ${className}`}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
}
