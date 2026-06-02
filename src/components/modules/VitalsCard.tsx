'use client';

import { Gauge } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { VitalsResult } from "@/types/scan";
import { useState } from "react";

interface Props {
  data: VitalsResult | null;
}

const metricLabels: Record<string, string> = {
  lcp: "LCP",
  cls: "CLS",
  inp: "INP",
  fcp: "FCP",
  ttfb: "TTFB",
};

export function VitalsCard({ data }: Props) {
  const [tab, setTab] = useState<"mobile" | "desktop">("mobile");

  if (!data) return null;

  if (data.error) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="h-4 w-4 text-zinc-500" />
          <h3 className="text-sm font-medium text-zinc-400">Core Web Vitals</h3>
        </div>
        <p className="text-xs text-zinc-600">{data.error}</p>
      </div>
    );
  }

  const vitals = data[tab];
  if (!vitals) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="h-4 w-4 text-zinc-500" />
          <h3 className="text-sm font-medium text-zinc-400">Core Web Vitals</h3>
        </div>
        <p className="text-xs text-zinc-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">Core Web Vitals</h3>
        </div>
      </div>
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setTab("mobile")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${tab === "mobile" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Mobile
        </button>
        <button
          onClick={() => setTab("desktop")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${tab === "desktop" ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Desktop
        </button>
      </div>
      <div className="space-y-2">
        {Object.entries(vitals).map(([key, metric]: [string, { value: string; status: string }]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-zinc-300 font-mono">{metricLabels[key] || key}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">{metric.value}</span>
              <StatusBadge status={metric.status} className="shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
