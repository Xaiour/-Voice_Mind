"use client";

import { useState, useCallback } from "react";
import { GlassCard } from "./GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Upload, CheckCircle2, Loader2 } from "lucide-react";

type UploadState = "idle" | "dragover" | "uploading" | "success";

export function VoiceUploadWidget() {
  const [state, setState] = useState<UploadState>("idle");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragover");
  }, []);

  const handleDragLeave = useCallback(() => {
    setState("idle");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("uploading");
    // Simulate upload
    setTimeout(() => setState("success"), 2000);
    setTimeout(() => setState("idle"), 4000);
  }, []);

  const handleClick = () => {
    setState("uploading");
    setTimeout(() => setState("success"), 2000);
    setTimeout(() => setState("idle"), 4000);
  };

  return (
    <GlassCard glow="purple" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/[0.03] to-cyan-600/[0.02]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Voice Upload
          </span>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer
            transition-all duration-300
            ${state === "dragover"
              ? "border-purple-400/50 bg-purple-500/5 scale-[1.02]"
              : state === "uploading"
              ? "border-amber-400/30 bg-amber-500/5"
              : state === "success"
              ? "border-emerald-400/30 bg-emerald-500/5"
              : "border-white/10 hover:border-purple-400/30 hover:bg-white/[0.02]"
            }
          `}
        >
          <AnimatePresence mode="wait">
            {state === "idle" || state === "dragover" ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">
                    {state === "dragover" ? "Drop to analyze" : "Drop audio file or click"}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    WAV, MP3, OGG, WebM (max 50MB)
                  </p>
                </div>
              </motion.div>
            ) : state === "uploading" ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <p className="text-sm font-medium text-amber-400">
                  Analyzing voice patterns...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-3"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">
                  Analysis complete!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Sessions", value: "47" },
            { label: "This Week", value: "3" },
            { label: "Avg Duration", value: "4:32" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-white/[0.02]">
              <p className="text-xs text-white/30">{stat.label}</p>
              <p className="text-sm font-bold text-white/80 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
