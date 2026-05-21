"use client";

import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "chart" | "table" | "text";
}

export function LoadingSkeleton({ className, variant = "card" }: LoadingSkeletonProps) {
  if (variant === "chart") {
    return (
      <div className={cn("animate-pulse space-y-3", className)}>
        <div className="h-4 w-32 rounded bg-white/5" />
        <div className="h-[200px] rounded-xl bg-white/[0.03] border border-white/5 flex items-end gap-2 p-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-white/5"
              style={{ height: `${30 + Math.random() * 50}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("animate-pulse space-y-3", className)}>
        <div className="h-4 w-40 rounded bg-white/5" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-white/[0.03] border border-white/5" />
        ))}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("animate-pulse space-y-2", className)}>
        <div className="h-3 w-3/4 rounded bg-white/5" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] p-6", className)}>
      <div className="h-4 w-24 rounded bg-white/5 mb-4" />
      <div className="h-8 w-16 rounded bg-white/5 mb-2" />
      <div className="h-3 w-32 rounded bg-white/5" />
    </div>
  );
}
