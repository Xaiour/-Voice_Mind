"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8">
      <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
      <p className="mt-2 text-slate-400 text-sm">
        Sign in to your VoiceMind account
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Email</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-slate-300">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
