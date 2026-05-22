"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

const ParticleBackground = dynamic(
  () => import("@/components/three-d/ParticleBackground"),
  { ssr: false }
);

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTER_SUGGESTIONS = [
  "How can I reduce daily stress?",
  "Suggest a 5-minute breathing exercise",
  "What does my voice analysis mean?",
  "Give me a bedtime routine for better sleep",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text?: string) => {
    const userMessage = (text || input).trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const { data } = await api.post("/ai/chat", {
        message: userMessage,
        conversationId,
      });

      setConversationId(data.data.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.data.reply },
      ]);
    } catch {
      toast.error("Failed to get response");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that right now. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="relative min-h-screen text-slate-100 font-sans flex flex-col" style={{ backgroundColor: "#050510" }}>
      <ParticleBackground />

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10">
        <nav className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3 rounded-full glass-panel">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              &larr; Dashboard
            </Link>
            <div className="w-[1px] h-4 bg-slate-800" />
            <span className="text-sm font-bold text-neon-gradient">AI Wellness Chat</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-950/20 text-[10px] font-semibold text-emerald-400">
            <Sparkles className="w-3 h-3" />
            GPT-4o
          </div>
        </nav>
      </header>

      {/* Chat Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-4 relative z-10 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto rounded-2xl glass-card p-6 space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center">
                <Bot className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-200">Hi! I&apos;m your wellness companion</h2>
                <p className="text-xs text-slate-500 mt-2 max-w-sm">
                  Ask me about breathing exercises, daily habits, sleep routines, or what your voice analysis results mean.
                </p>
              </div>
              {/* Starter suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {STARTER_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/30 text-xs text-slate-400 hover:text-slate-200 hover:border-purple-500/30 hover:bg-purple-950/10 transition-all text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                    : "bg-slate-900/60 border border-slate-800 text-slate-200"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-2xl">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-cyan-400/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about exercises, habits, or your emotional wellness..."
            className="flex-1 px-5 py-3.5 rounded-full border border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[9px] text-slate-600 text-center mt-2">
          VoiceMind AI is not a therapist. For emergencies, contact 988 Suicide & Crisis Lifeline.
        </p>
      </main>
    </div>
  );
}
