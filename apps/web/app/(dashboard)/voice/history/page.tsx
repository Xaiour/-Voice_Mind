"use client";

import { motion } from "framer-motion";
import { useAnalysis } from "@/hooks/useAnalysis";
import { AnalysisCard } from "@/components/features/analysis/AnalysisCard";

export default function VoiceHistoryPage() {
  const { analyses, isLoading } = useAnalysis();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Analysis History</h1>
        <p className="text-muted-foreground">
          View all your past voice analysis results.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : analyses?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>No analyses yet. Upload your first audio recording to begin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses?.map((analysis: any) => (
            <AnalysisCard key={analysis._id} analysis={analysis} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
