import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind CSS classes with proper conflict resolution.
 * Used by all ShadCN components and custom components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to a readable string.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format duration in seconds to mm:ss.
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get sentiment label from score (1-10).
 */
export function getSentimentLabel(score: number): string {
  if (score >= 8) return "Very Positive";
  if (score >= 6) return "Positive";
  if (score >= 4) return "Neutral";
  if (score >= 2) return "Negative";
  return "Very Negative";
}

/**
 * Get color class for sentiment score.
 */
export function getSentimentColor(score: number): string {
  if (score >= 7) return "text-green-500";
  if (score >= 4) return "text-yellow-500";
  return "text-red-500";
}
