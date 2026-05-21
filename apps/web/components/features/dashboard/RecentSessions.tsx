"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { FileAudio } from "lucide-react";
import Link from "next/link";

export function RecentSessions() {
  const { data, isLoading } = useQuery({
    queryKey: ["recent-sessions"],
    queryFn: async () => {
      const { data } = await api.get("/voice/history?limit=5");
      return data.data;
    },
  });

  return (
    <div className="p-5 rounded-xl border border-border bg-card h-full">
      <h3 className="font-semibold mb-4">Recent Sessions</h3>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : data?.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No sessions yet. Record your first audio.
        </p>
      ) : (
        <div className="space-y-3">
          {data?.map((session: any) => (
            <Link
              key={session._id}
              href={`/voice/analysis/${session._id}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileAudio className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.audioFileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(session.createdAt)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground capitalize">
                {session.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
