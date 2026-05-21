"use client";

import { Clock, Brain, AlertTriangle } from "lucide-react";
import { formatDate, getSentimentLabel, getSentimentColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AnalysisCardProps {
  analysis: any;
  className?: string;
}

export function AnalysisCard({ analysis, className }: AnalysisCardProps) {
  const sentiment = analysis.aiInsights?.sentimentScore;
  const emotion = analysis.emotions?.primary;
  const status = analysis.status;

  return (
    <Link href={`/voice/analysis/${analysis._id}`}>
      <div
        className={cn(
          "p-5 rounded-xl border border-border bg-card hover:shadow-md transition cursor-pointer group",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
              status === "processing" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
              status === "failed" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              status === "pending" && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
            )}
          >
            {status}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(analysis.createdAt)}
          </span>
        </div>

        {/* File name */}
        <p className="font-medium text-sm truncate group-hover:text-primary transition">
          {analysis.audioFileName}
        </p>

        {/* Results (if completed) */}
        {status === "completed" && analysis.aiInsights && (
          <div className="mt-3 space-y-2">
            {/* Sentiment */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Sentiment</span>
              <span className={cn("text-sm font-semibold", getSentimentColor(sentiment))}>
                {sentiment}/10 — {getSentimentLabel(sentiment)}
              </span>
            </div>

            {/* Primary emotion */}
            {emotion && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Emotion</span>
                <span className="text-sm font-medium capitalize flex items-center gap-1">
                  <Brain className="w-3 h-3 text-primary" />
                  {emotion}
                </span>
              </div>
            )}

            {/* Risk indicators */}
            {analysis.aiInsights.riskIndicators?.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-500 mt-2">
                <AlertTriangle className="w-3 h-3" />
                {analysis.aiInsights.riskIndicators.length} risk indicator(s)
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
