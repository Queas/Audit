'use client';

import { Activity } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { UptimeResult } from "@/types/scan";

interface Props {
  data: UptimeResult | null;
}

export function UptimeCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">Uptime Snapshot</h3>
        </div>
        <StatusBadge status={data.online ? "online" : "issue detected"} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Status Code</div>
          <div className="text-zinc-300 font-mono">{data.statusCode || "N/A"}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Response Time</div>
          <div className="text-zinc-300 font-mono">
            {data.responseTimeMs !== null ? `${data.responseTimeMs}ms` : "N/A"}
            <span className="text-xs text-zinc-600 ml-1">
              ({data.speedLabel})
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-zinc-700 mt-3">
        Checked once at {new Date(data.timestamp).toLocaleString()}. Not historical uptime data.
      </p>
    </div>
  );
}
