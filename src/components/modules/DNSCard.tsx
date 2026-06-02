'use client';

import { Network } from "lucide-react";
import type { DNSResult } from "@/types/scan";

interface Props {
  data: DNSResult | null;
}

export function DNSCard({ data }: Props) {
  if (!data) return null;

  const grouped = data.records.reduce<Record<string, { name: string; value: string }[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push({ name: r.name, value: r.value });
    return acc;
  }, {});

  const typeOrder = ["A", "AAAA", "MX", "NS", "TXT"];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">DNS Intelligence</h3>
        </div>
      </div>
      {data.providers.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {data.providers.map((p) => (
            <span key={p} className="inline-flex items-center rounded-full border border-[#00d4aa]/30 bg-[#00d4aa]/10 px-2 py-0.5 text-xs text-[#00d4aa]">
              {p}
            </span>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {typeOrder.map((type) => {
          const records = grouped[type];
          if (!records || records.length === 0) return null;
          return (
            <div key={type}>
              <div className="text-xs text-zinc-500 mb-1 font-mono">{type} Records ({records.length})</div>
              {records.slice(0, 5).map((r, i) => (
                <div key={i} className="text-xs text-zinc-300 font-mono truncate pl-2 border-l border-zinc-800 mb-0.5">
                  {r.value}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
