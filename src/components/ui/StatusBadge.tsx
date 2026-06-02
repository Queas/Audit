'use client';

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  healthy: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  good: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  present: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  found: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  fast: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  ok: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  online: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "needs-improvement": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  misconfigured: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  moderate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  redirect: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  critical: "bg-red-500/15 text-red-400 border-red-500/30",
  issue: "bg-red-500/15 text-red-400 border-red-500/30",
  missing: "bg-red-500/15 text-red-400 border-red-500/30",
  not_found: "bg-red-500/15 text-red-400 border-red-500/30",
  broken: "bg-red-500/15 text-red-400 border-red-500/30",
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  slow: "bg-red-500/15 text-red-400 border-red-500/30",
  poor: "bg-red-500/15 text-red-400 border-red-500/30",
  "issue detected": "bg-red-500/15 text-red-400 border-red-500/30",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = statusColors[status.toLowerCase()] || "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        color,
        className
      )}
    >
      {status}
    </span>
  );
}
