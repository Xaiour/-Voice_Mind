"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Mic, Brain, TrendingUp, Clock } from "lucide-react";

export function StatsGrid() {
  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/voice/history?limit=100");
      // Compute stats from history
      const analyses = data.data || [];
      const completed = analyses.filter((a: any) => a.status === "completed");
      const avgSentiment =
        completed.reduce(
          (sum: number, a: any) => sum + (a.aiInsights?.sentimentScore || 0),
          0
        ) / (completed.length || 1);

      return {
        totalSessions: data.pagination?.total || 0,
        completedAnalyses: completed.length,
        avgSentiment: avgSentiment.toFixed(1),
        totalMinutes: Math.round(
          analyses.reduce((sum: number, a: any) => sum + (a.audioDuration || 0), 0) / 60
        ),
      };
    },
  });

  const stats = [
    {
      label: "Total Sessions",
      value: data?.totalSessions || 0,
      icon: Mic,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Analyses Done",
      value: data?.completedAnalyses || 0,
      icon: Brain,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Avg Sentiment",
      value: `${data?.avgSentiment || 0}/10`,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Audio Minutes",
      value: data?.totalMinutes || 0,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="p-5 rounded-xl border border-border bg-card hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
