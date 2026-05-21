"use client";

import { motion } from "framer-motion";
import { Mic, Brain, TrendingUp, Clock } from "lucide-react";
import { StatsGrid } from "@/components/features/dashboard/StatsGrid";
import { RecentSessions } from "@/components/features/dashboard/RecentSessions";
import { ActivityChart } from "@/components/features/dashboard/ActivityChart";

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s your voice analysis overview.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsGrid />

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <div>
          <RecentSessions />
        </div>
      </div>
    </motion.div>
  );
}
