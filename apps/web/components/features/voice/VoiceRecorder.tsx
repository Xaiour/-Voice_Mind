"use client";

import { Mic, Square, Pause, Play, Upload } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useAnalysis } from "@/hooks/useAnalysis";
import { formatDuration } from "@/lib/utils";
import { toast } from "sonner";

export function VoiceRecorder() {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    reset,
  } = useVoiceRecorder();

  const { uploadAudio, isUploading } = useAnalysis();

  const handleUpload = () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
      type: "audio/webm",
    });
    uploadAudio(file);
    reset();
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Waveform visualization (placeholder) */}
      <div className="flex items-center gap-1 h-16">
        {isRecording &&
          Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-pulse_wave"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        {!isRecording && !audioUrl && (
          <p className="text-muted-foreground text-sm">
            Click the mic to start recording
          </p>
        )}
      </div>

      {/* Timer */}
      {(isRecording || audioUrl) && (
        <p className="text-2xl font-mono font-bold">{formatDuration(duration)}</p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition shadow-lg"
          >
            <Mic className="w-7 h-7" />
          </button>
        )}

        {isRecording && (
          <>
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition"
            >
              {isPaused ? (
                <Play className="w-5 h-5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center text-white hover:opacity-90 transition shadow-lg"
            >
              <Square className="w-6 h-6" />
            </button>
          </>
        )}

        {audioUrl && !isRecording && (
          <>
            <audio src={audioUrl} controls className="max-w-[200px]" />
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Analyze"}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2.5 border border-border rounded-lg hover:bg-accent transition"
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
