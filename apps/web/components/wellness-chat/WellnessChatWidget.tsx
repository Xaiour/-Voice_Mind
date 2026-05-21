"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircleHeart,
  X,
  Send,
  Sparkles,
  Loader2,
  RotateCcw,
  Heart,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ─── Component ──────────────────────────────────────────────

export function WellnessChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Auto-scroll ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ─── Focus input when opened ────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  // ─── Welcome message on first open ─────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              "Hi there 🌿 I'm your wellness companion. How are you feeling right now? There's no right or wrong answer — just share whatever comes to mind.",
            timestamp: Date.now(),
          },
        ]);
        setIsTyping(false);
      }, 1200);
    }
  }, [isOpen, messages.length]);

  // ─── Send Message ───────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // In production, replace with actual API call:
      // const { data } = await api.post("/wellness/chat", { message: text, sessionId });
      // setSessionId(data.data.sessionId);

      // Simulated AI response
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

      const aiReply = getSimulatedResponse(text, messages.length);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: aiReply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "I'm having a moment of my own right now. Could you try again in a few seconds? I'm here for you.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, isOpen, messages.length]);

  // ─── Handle Enter Key ──────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Reset Conversation ─────────────────────────────────
  const resetChat = () => {
    setMessages([]);
    setSessionId(undefined);
  };

  // ─── Render ─────────────────────────────────────────────
  return (
    <>
      {/* ─── Floating Chat Button ─────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
          >
            <MessageCircleHeart className="w-6 h-6 text-white" />
            {/* Unread indicator */}
            {hasUnread && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-[#0a0a0f]"
              />
            )}
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping opacity-40" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Chat Panel ───────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] max-h-[80vh] flex flex-col rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0d0d14]/95 backdrop-blur-2xl shadow-2xl shadow-black/50"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-purple-600/[0.08] rounded-full blur-[60px]" />
              <div className="absolute bottom-20 right-0 w-32 h-32 bg-cyan-500/[0.05] rounded-full blur-[50px]" />
            </div>

            {/* ─── Header ─────────────────────────────────── */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d0d14]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">
                    Wellness Companion
                  </h3>
                  <p className="text-[10px] text-white/30">
                    Always here for you
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition"
                  title="New conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── Messages ───────────────────────────────── */}
            <div className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-white rounded-br-md"
                        : "bg-white/[0.04] border border-white/[0.06] text-white/70 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-purple-400/60"
                          animate={{
                            y: [0, -6, 0],
                            opacity: [0.4, 1, 0.4],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── Input Area ─────────────────────────────── */}
            <div className="relative px-4 py-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Share how you're feeling..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-purple-500/30 focus:bg-white/[0.06] transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
              <p className="text-[9px] text-white/15 text-center mt-2">
                Not a substitute for professional care. If in crisis, call 988.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Simulated Responses (replace with API in production) ───

function getSimulatedResponse(message: string, msgCount: number): string {
  const lower = message.toLowerCase();

  // Crisis
  if (
    lower.includes("kill myself") ||
    lower.includes("suicide") ||
    lower.includes("want to die")
  ) {
    return "I hear you, and I want you to know you matter. Please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) right now. You deserve immediate support from someone trained to help. I care about you.";
  }

  // Greetings
  if (lower.match(/^(hi|hello|hey|good morning|good evening)/)) {
    return "Hey there 🌿 I'm glad you're here. How has your day been so far? Sometimes just pausing to notice how we feel is the first step toward feeling better.";
  }

  // Stress
  if (lower.includes("stress") || lower.includes("overwhelm") || lower.includes("too much")) {
    return "That sounds like a heavy load to carry. When stress builds up, our body holds it in ways we don't always notice — like tension in the shoulders or shallow breathing.\n\nWould you like to try a quick 30-second breathing exercise together? Or would it help to talk through what's weighing on you most?";
  }

  // Anxiety
  if (lower.includes("anxious") || lower.includes("worried") || lower.includes("panic")) {
    return "Anxiety can feel so overwhelming, especially when it takes over your body. You're safe right now, in this moment.\n\nTry this: press your feet firmly into the floor and notice the solid ground beneath you. That simple sensation can begin to settle your nervous system. What's your biggest worry right now?";
  }

  // Sadness
  if (lower.includes("sad") || lower.includes("down") || lower.includes("depressed") || lower.includes("cry")) {
    return "I'm sorry you're feeling this way. Sadness is a valid emotion — it's your heart's way of processing something important.\n\nYou don't have to force yourself to feel differently. Is there something specific that's been weighing on you, or is it more of a general heaviness?";
  }

  // Sleep
  if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted")) {
    return "Rest is so fundamental to how we feel emotionally. When we're depleted, everything feels harder.\n\nOne gentle thing you could try tonight: dim the lights an hour before bed and do something quiet that you enjoy — reading, stretching, or just sitting with a warm drink. What does your evening usually look like?";
  }

  // Good / positive
  if (lower.includes("good") || lower.includes("better") || lower.includes("happy") || lower.includes("great")) {
    return "That's wonderful to hear ✨ It's worth noticing and celebrating these moments, even the quiet good days.\n\nWhat do you think contributed to feeling this way? Understanding our positive patterns can help us create more of them.";
  }

  // Default contextual responses
  const defaults = [
    "Thank you for sharing that with me. It takes openness to put feelings into words. What does this feel like in your body right now — do you notice any tension or heaviness anywhere?",
    "I appreciate you telling me that. Our emotions often carry important messages. What do you think yours is trying to tell you today?",
    "That's really insightful. Sometimes just naming what we feel can take away some of its intensity. Is there anything I can help you with right now — a calming technique, or would you rather keep talking?",
    "I hear you. Whatever you're experiencing is valid. Would it help to try a quick grounding exercise, or would you prefer to explore these feelings a bit more together?",
  ];

  return defaults[msgCount % defaults.length];
}
