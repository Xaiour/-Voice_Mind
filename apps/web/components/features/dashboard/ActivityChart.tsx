"use client";

import { BarChart3 } from "lucide-react";

/**
 * Activity Chart placeholder — integrate with Recharts for real data.
 * Shows weekly voice analysis activity.
 */
export function ActivityChart() {
  // Placeholder data — replace with real TanStack Query fetch
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const mockData = [3, 5, 2, 7, 4, 1, 6];
  const maxValue = Math.max(...mockData);

  return (
    <div className="p-5 rounded-xl border border-border bg-card h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold">Weekly Activity</h3>
        <BarChart3 className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Simple bar chart */}
      <div className="flex items-end justify-between gap-2 h-40">
        {weekDays.map((day, i) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex justify-center">
              <div
                className="w-8 rounded-t-md bg-primary/20 hover:bg-primary/40 transition relative group"
                style={{ height: `${(mockData[i] / maxValue) * 100}%`, minHeight: "8px" }}
              >
                {/* Tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-foreground text-background px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {mockData[i]} sessions
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
