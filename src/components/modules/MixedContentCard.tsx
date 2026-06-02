'use client';

import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { MixedContentResult } from "@/types/scan";

interface Props {
  data: MixedContentResult | null;
}

const typeIcons: Record<string, string> = {
  script: "📜",
  image: "🖼",
  stylesheet: "🎨",
  iframe: "📦",
  form: "📋",
};

export function MixedContentCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">Mixed Content</h3>
        </div>
        <StatusBadge status={data.risk} />
      </div>
      {data.totalInsecure === 0 ? (
        <p className="text-sm text-zinc-400">No mixed content detected</p>
      ) : (
        <>
          <p className="text-sm text-zinc-400 mb-3">{data.totalInsecure} insecure resource{data.totalInsecure > 1 ? "s" : ""} found</p>
          <div className="space-y-1.5">
            {data.items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span>{typeIcons[item.type] || "🔗"}</span>
                <span className="text-zinc-300 font-mono truncate">{item.url}</span>
                <span className="text-zinc-600 shrink-0">{item.type}</span>
              </div>
            ))}
          </div>
          {data.remainingCount > 0 && (
            <p className="text-xs text-zinc-600 mt-2">...and {data.remainingCount} more</p>
          )}
        </>
      )}
    </div>
  );
}
