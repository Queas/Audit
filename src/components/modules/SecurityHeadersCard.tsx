'use client';

import { ShieldAlert } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SecurityHeadersResult } from "@/types/scan";

interface Props {
  data: SecurityHeadersResult | null;
}

export function SecurityHeadersCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">Security Headers</h3>
        </div>
        <span className="text-sm font-mono text-zinc-400">
          Score: <span className={data.score >= 80 ? "text-[#00d4aa]" : data.score >= 50 ? "text-amber-400" : "text-red-400"}>{data.score}</span>
        </span>
      </div>
      <div className="space-y-2">
        {data.headers.map((h) => (
          <div key={h.header} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-300 font-mono">{h.header}</div>
              {h.value && (
                <div className="text-xs text-zinc-600 font-mono truncate max-w-[250px]">{h.value}</div>
              )}
            </div>
            <StatusBadge status={h.status} className="shrink-0 ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
