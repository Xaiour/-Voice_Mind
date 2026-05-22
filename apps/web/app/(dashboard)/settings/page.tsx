"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const ParticleBackground = dynamic(
  () => import("@/components/three-d/ParticleBackground"),
  { ssr: false }
);

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    specialization: user?.specialization || "",
    bio: user?.bio || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.put("/users/profile", formData);
      setUser(data.data);
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="relative min-h-screen text-slate-100 font-sans" style={{ backgroundColor: "#050510" }}>
      <ParticleBackground />

      {/* Header */}
      <header className="w-full px-6 py-4 relative z-10">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-full glass-panel">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
              &larr; Dashboard
            </Link>
            <div className="w-[1px] h-4 bg-slate-800" />
            <span className="text-sm font-bold text-neon-gradient">Settings</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full border border-rose-500/30 bg-rose-950/20 text-xs font-semibold text-rose-400 hover:border-rose-500/50 transition-colors"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="w-full max-w-2xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your profile and preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">First Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Last Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/30 text-slate-500 text-sm cursor-not-allowed"
              value={user?.email || ""}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Specialization</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm"
              placeholder="e.g., Clinical Psychology"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bio</label>
            <textarea
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm resize-none"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Danger Zone */}
        <div className="mt-8 glass-card rounded-2xl p-6 border-rose-500/10">
          <h3 className="text-sm font-bold text-rose-400 mb-2">Danger Zone</h3>
          <p className="text-[11px] text-slate-500 mb-4">Logging out will clear your session. You can log back in anytime.</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-full border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}
