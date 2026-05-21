"use client";

import { GlassCard } from "./GlassCard";
import { motion } from "framer-motion";
import { FileAudio, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const DUMMY_ANALYSES = [
  {
    id: "1",
    fileName: "session_morning_check.wav",
    date: "2024-03-15 09:32",
    duration: "4:21",
    status: "completed" as const,
    sentiment: 7.8,
    emotion: "Calm",
  },
  {
    id: "2",
    fileName: "therapy_note_patient_5.mp3",
    date: "2024-03-14 14:15",
    duration: "12:47",
    status: "completed" as const,
    sentiment: 4.2,
    emotion: "Stressed",
  },
  {
    id: "3",
    fileName: "evening_reflection.webm",
    date: "2024-03-14 20:08",
    duration: "3:55",
    status: "completed" as const,
    sentiment: 6.5,
    emotion: "Neutral",
  },
  {
    id: "4",
    fileName: "group_session_audio.wav",
    date: "2024-03-13 11:00",
    duration: "28:12",
    status: "processing" as const,
    sentiment: null,
    emotion: null,
  },
  {
    id: "5",
    fileName: "patient_intake_call.mp3",
    date: "2024-03-13 08:45",
    duration: "6:03",
    status: "failed" as const,
    sentiment: null,
    emotion: null,
  },
];

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    label: "Done",
  },
  processing: {
    icon: Loader2,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    label: "Processing",
  },
  failed: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-400/10",
    label: "Failed",
  },
};

const getSentimentColor = (score: number | null) => {
  if (!score) return "text-white/30";
  if (score >= 7) return "text-emerald-400";
  if (score >= 4) return "text-amber-400";
  return "text-red-400";
};

export function RecentAnalysesTable() {
  return (
    <GlassCard glow="none" className="relative overflow-hidden">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FileAudio className="w-4 h-4 text-white/40" />
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Recent Analyses
            </span>
          </div>
          <button className="text-xs text-purple-400 hover:text-purple-300 transition">
            View All
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider pb-3">File</th>
                <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider pb-3 hidden sm:table-cell">Date</th>
                <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider pb-3 hidden md:table-cell">Duration</th>
                <th className="text-center text-[10px] font-medium text-white/30 uppercase tracking-wider pb-3">Status</th>
                <th className="text-right text-[10px] font-medium text-white/30 uppercase tracking-wider pb-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {DUMMY_ANALYSES.map((analysis, i) => {
                const status = statusConfig[analysis.status];
                const StatusIcon = status.icon;
                return (
                  <motion.tr
                    key={analysis.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="group hover:bg-white/[0.02] transition cursor-pointer"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                          <FileAudio className="w-3.5 h-3.5 text-white/40" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white/70 truncate max-w-[160px] group-hover:text-white transition">
                            {analysis.fileName}
                          </p>
                          {analysis.emotion && (
                            <p className="text-[10px] text-white/30">{analysis.emotion}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/20" />
                        <span className="text-xs text-white/40">{analysis.date}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="text-xs text-white/40 font-mono">{analysis.duration}</span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                        <StatusIcon className={`w-3 h-3 ${analysis.status === "processing" ? "animate-spin" : ""}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`text-sm font-bold font-mono ${getSentimentColor(analysis.sentiment)}`}>
                        {analysis.sentiment ? `${analysis.sentiment}/10` : "—"}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </GlassCard>
  );
}
