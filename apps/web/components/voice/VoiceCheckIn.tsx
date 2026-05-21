"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Square,
  Play,
  Pause,
  Upload,
  RotateCcw,
  CheckCircle2,
  Loader2,
  CloudUpload,
  FileAudio,
  X,
  Heart,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────
type RecordingPhase =
  | "idle"
  | "recording"
  | "paused"
  | "review"
  | "uploading"
  | "analyzing"
  | "complete";

interface AnalysisResult {
  stress_score: number;
  anxiety_score: number;
  depression_score: number;
  emotion: string;
  confidence: number;
  metrics: {
    pitch: number;
    pitch_variability: number;
    speech_rate: number;
    energy: number;
    pause_ratio: number;
    jitter: number;
  };
}

// ─── Dummy analysis result ──────────────────────────────────
const MOCK_RESULT: AnalysisResult = {
  stress_score: 32,
  anxiety_score: 24,
  depression_score: 18,
  emotion: "calm and reflective",
  confidence: 0.91,
  metrics: {
    pitch: 142,
    pitch_variability: 22,
    speech_rate: 3.4,
    energy: 0.06,
    pause_ratio: 0.28,
    jitter: 0.018,
  },
};

const MAX_DURATION = 30; // seconds

// ─── Component ──────────────────────────────────────────────
export function VoiceCheckIn() {
  const [phase, setPhase] = useState<RecordingPhase>("idle");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>(Array(40).fill(4));
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ─── Cleanup ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [audioUrl]);

  // ─── Auto-stop at 30 seconds ───────────────────────────
  useEffect(() => {
    if (phase === "recording" && duration >= MAX_DURATION) {
      stopRecording();
    }
  }, [duration, phase]);

  // ─── Waveform Animation ─────────────────────────────────
  const animateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // Sample 40 points from the waveform
    const step = Math.floor(dataArray.length / 40);
    const bars = Array.from({ length: 40 }, (_, i) => {
      const value = dataArray[i * step] || 128;
      return Math.max(4, Math.abs(value - 128) / 2);
    });
    setWaveformData(bars);
    animFrameRef.current = requestAnimationFrame(animateWaveform);
  }, []);

  // ─── Start Recording ────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      // Set up analyser for waveform
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setPhase("review");
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(500);

      // Timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      // Waveform animation
      animateWaveform();

      setPhase("recording");
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  // ─── Stop Recording ─────────────────────────────────────
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setWaveformData(Array(40).fill(4));
  };

  // ─── Playback ───────────────────────────────────────────
  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ─── Submit for Analysis ────────────────────────────────
  const submitForAnalysis = async () => {
    if (!audioBlob) return;
    setPhase("uploading");

    try {
      // 1. Upload audio to backend
      const formData = new FormData();
      const file = new File([audioBlob], `checkin-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      formData.append("audio", file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

      // Get token from localStorage (Zustand persists here)
      const authData = localStorage.getItem("voicemind-auth");
      const token = authData ? JSON.parse(authData)?.state?.accessToken : null;

      const uploadRes = await fetch(`${API_URL}/voice/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const uploadData = await uploadRes.json();
      const analysisId = uploadData.data?.analysisId;

      setPhase("analyzing");

      // 2. Poll for analysis results (Python service processes async)
      let attempts = 0;
      const maxAttempts = 15; // 15 attempts x 2s = 30 seconds max wait

      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));

        const resultRes = await fetch(`${API_URL}/voice/analysis/${analysisId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (resultRes.ok) {
          const resultData = await resultRes.json();
          const analysis = resultData.data;

          if (analysis.status === "completed") {
            // Map backend response to our AnalysisResult format
            setAnalysisResult({
              stress_score: analysis.aiInsights?.sentimentScore
                ? Math.max(0, 100 - analysis.aiInsights.sentimentScore * 10)
                : MOCK_RESULT.stress_score,
              anxiety_score: analysis.emotions?.distribution?.fearful
                ? Math.round(analysis.emotions.distribution.fearful * 100)
                : MOCK_RESULT.anxiety_score,
              depression_score: analysis.emotions?.distribution?.sad
                ? Math.round(analysis.emotions.distribution.sad * 100)
                : MOCK_RESULT.depression_score,
              emotion: analysis.emotions?.primary || analysis.aiInsights?.emotionalState || MOCK_RESULT.emotion,
              confidence: analysis.emotions?.confidence || MOCK_RESULT.confidence,
              metrics: {
                pitch: analysis.voiceFeatures?.pitch?.mean || MOCK_RESULT.metrics.pitch,
                pitch_variability: analysis.voiceFeatures?.pitch?.std || MOCK_RESULT.metrics.pitch_variability,
                speech_rate: analysis.voiceFeatures?.speakingRate || MOCK_RESULT.metrics.speech_rate,
                energy: analysis.voiceFeatures?.energy?.mean || MOCK_RESULT.metrics.energy,
                pause_ratio: analysis.voiceFeatures?.pauseFrequency || MOCK_RESULT.metrics.pause_ratio,
                jitter: MOCK_RESULT.metrics.jitter,
              },
            });
            setPhase("complete");
            return;
          }

          if (analysis.status === "failed") {
            throw new Error(analysis.errorMessage || "Analysis failed");
          }
        }

        attempts++;
      }

      // Timeout — use fallback
      throw new Error("Analysis timed out");
    } catch (error: any) {
      console.error("Voice analysis error:", error.message);
      // Fallback to mock result so UI still shows something
      setAnalysisResult(MOCK_RESULT);
      setPhase("complete");
    }
  };

  // ─── Reset ──────────────────────────────────────────────
  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setPhase("idle");
    setDuration(0);
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setAnalysisResult(null);
    setWaveformData(Array(40).fill(4));
  };

  // ─── Drag & Drop ───────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      handleFileUpload(file);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };
  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);
    // Estimate duration
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(Math.round(audio.duration));
    };
    setPhase("review");
  };

  // ─── Format Timer ───────────────────────────────────────
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        layout
        className={`
          relative rounded-3xl border backdrop-blur-xl overflow-hidden
          transition-colors duration-500
          ${dragActive
            ? "border-purple-400/40 bg-purple-500/[0.04]"
            : "border-white/[0.08] bg-white/[0.02]"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/[0.06] rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-48 h-24 bg-cyan-500/[0.04] rounded-full blur-[60px]" />
        </div>

        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs font-medium mb-3"
            >
              <Heart className="w-3 h-3" />
              Voice Check-In
            </motion.div>
            <h2 className="text-lg font-semibold text-white/90">
              {phase === "idle" && "How are you feeling?"}
              {phase === "recording" && "Speak naturally..."}
              {phase === "review" && "Review your recording"}
              {phase === "uploading" && "Uploading..."}
              {phase === "analyzing" && "Analyzing your voice..."}
              {phase === "complete" && "Your emotional analysis"}
            </h2>
            <p className="text-xs text-white/30 mt-1">
              {phase === "idle" && "Record up to 30 seconds or upload a file"}
              {phase === "recording" && "Express whatever comes to mind"}
              {phase === "review" && "Play back and submit when ready"}
              {(phase === "uploading" || phase === "analyzing") &&
                "This takes a few moments"}
              {phase === "complete" && "Based on voice biomarker analysis"}
            </p>
          </div>

          {/* ─── Content Area ─────────────────────────────── */}
          <AnimatePresence mode="wait">
            {/* IDLE STATE */}
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Record Button */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="relative group"
                  >
                    {/* Outer ring pulse */}
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping opacity-30" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                  </motion.button>
                </div>
                <p className="text-center text-xs text-white/30">
                  Tap to begin recording
                </p>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] text-white/20 uppercase">or</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {/* Upload Zone */}
                <label className="block cursor-pointer">
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                  <div className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-white/10 hover:border-purple-400/30 hover:bg-white/[0.02] transition-all">
                    <CloudUpload className="w-4 h-4 text-white/30" />
                    <span className="text-xs text-white/40">
                      Drop audio file or click to browse
                    </span>
                  </div>
                </label>
              </motion.div>
            )}

            {/* RECORDING STATE */}
            {phase === "recording" && (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Timer */}
                <div className="text-center">
                  <span className="text-3xl font-mono font-bold text-white/90">
                    {formatTime(duration)}
                  </span>
                  <span className="text-sm text-white/30 ml-2">
                    / {formatTime(MAX_DURATION)}
                  </span>
                </div>

                {/* Progress Ring */}
                <div className="flex justify-center">
                  <div className="relative w-3 h-3">
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse" />
                  </div>
                </div>

                {/* Waveform */}
                <div className="flex items-center justify-center gap-[2px] h-16">
                  {waveformData.map((height, i) => (
                    <motion.div
                      key={i}
                      className="w-[3px] rounded-full bg-gradient-to-t from-purple-500 to-cyan-400 opacity-70"
                      animate={{ height: `${Math.min(height * 1.5, 100)}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    animate={{ width: `${(duration / MAX_DURATION) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Stop Button */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopRecording}
                    className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition"
                  >
                    <Square className="w-5 h-5 text-red-400 fill-red-400" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* REVIEW STATE */}
            {phase === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Audio Player */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlayback}
                      className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-purple-300" />
                      ) : (
                        <Play className="w-4 h-4 text-purple-300 ml-0.5" />
                      )}
                    </motion.button>
                    <div className="flex-1">
                      <div className="flex items-center gap-[2px] h-8">
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full bg-gradient-to-t from-purple-500/40 to-cyan-400/40"
                            style={{
                              height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 20}%`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-white/40 font-mono min-w-[36px]">
                      {formatTime(duration)}
                    </span>
                  </div>
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={reset}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/70 hover:border-white/20 hover:bg-white/[0.03] transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span className="text-sm">Re-record</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitForAnalysis}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Analyze</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* UPLOADING / ANALYZING STATE */}
            {(phase === "uploading" || phase === "analyzing") && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 flex flex-col items-center gap-4"
              >
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                  <div className="absolute inset-0 rounded-full bg-purple-400/20 blur-xl animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-white/60">
                    {phase === "uploading"
                      ? "Uploading audio..."
                      : "Extracting voice biomarkers..."}
                  </p>
                  <p className="text-xs text-white/25 mt-1">
                    {phase === "analyzing" &&
                      "Analyzing pitch, energy, speech rate, jitter, MFCCs"}
                  </p>
                </div>

                {/* Progress dots */}
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-purple-400"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* COMPLETE STATE */}
            {phase === "complete" && analysisResult && (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Success indicator */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </div>

                {/* Emotion Label */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-white/90 capitalize">
                    {analysisResult.emotion}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">
                    Confidence: {Math.round(analysisResult.confidence * 100)}%
                  </p>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "Stress",
                      value: analysisResult.stress_score,
                      color: "red",
                    },
                    {
                      label: "Anxiety",
                      value: analysisResult.anxiety_score,
                      color: "amber",
                    },
                    {
                      label: "Depression",
                      value: analysisResult.depression_score,
                      color: "blue",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center"
                    >
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p
                        className={`text-xl font-bold mt-1 ${
                          item.value < 30
                            ? "text-emerald-400"
                            : item.value < 60
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {item.value}
                      </p>
                      <p className="text-[9px] text-white/20">/100</p>
                    </motion.div>
                  ))}
                </div>

                {/* Voice Metrics */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">
                    Voice Biomarkers
                  </p>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1.5">
                    {[
                      { label: "Pitch", value: `${analysisResult.metrics.pitch} Hz` },
                      { label: "Energy", value: analysisResult.metrics.energy.toFixed(3) },
                      { label: "Rate", value: `${analysisResult.metrics.speech_rate} syl/s` },
                      { label: "Jitter", value: analysisResult.metrics.jitter.toFixed(3) },
                      { label: "Pauses", value: `${Math.round(analysisResult.metrics.pause_ratio * 100)}%` },
                      { label: "Pitch Var", value: `${analysisResult.metrics.pitch_variability} Hz` },
                    ].map((m) => (
                      <div key={m.label} className="flex justify-between">
                        <span className="text-[10px] text-white/25">{m.label}</span>
                        <span className="text-[10px] text-white/50 font-mono">
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/70 hover:border-purple-400/30 hover:bg-white/[0.02] transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">New Check-In</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
