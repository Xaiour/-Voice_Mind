"use client";

import { motion } from "framer-motion";
import { VoiceRecorder } from "@/components/features/voice/VoiceRecorder";
import { UploadDropzone } from "@/components/features/voice/UploadDropzone";

export default function VoicePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold">Voice Analysis</h1>
        <p className="text-muted-foreground">
          Record or upload audio for AI-powered emotional analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Recording */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Record Audio</h2>
          <VoiceRecorder />
        </div>

        {/* File Upload */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold mb-4">Upload File</h2>
          <UploadDropzone />
        </div>
      </div>
    </motion.div>
  );
}
