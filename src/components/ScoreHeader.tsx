'use client';

import type { AIBreakdown } from "@/types/scan";

interface ScoreHeaderProps {
  scores: AIBreakdown | null;
  scannedAt: string | null;
  isCached: boolean;
  cachedTtl?: number;
}

export function ScoreHeader({ scores, scannedAt, isCached }: ScoreHeaderProps) {
  if (!scores) return null;

  const overallColor = scores.overall >= 80 ? "text-[#00d4aa]" : scores.overall >= 50 ? "text-amber-400" : "text-red-400";

  const bars = [
    { label: "Security", score: scores.securityScore, weight: "30%" },
    { label: "SEO", score: scores.seoScore, weight: "25%" },
    { label: "Performance", score: scores.performanceScore, weight: "25%" },
    { label: "Reliability", score: scores.reliabilityScore, weight: "20%" },
  ];

  return (
    <div className="text-center mb-8">
      <div className={`text-7xl font-bold font-mono ${overallColor} leading-none mb-2`}>
        {scores.overall}
        <span className="text-2xl text-zinc-600">/100</span>
      </div>
      <p className="text-xs text-zinc-600 mb-6">Overall Health Score</p>
      <div className="max-w-lg mx-auto space-y-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 w-20 text-right">{bar.label}</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${bar.score}%`,
                  backgroundColor: bar.score >= 80 ? "#00d4aa" : bar.score >= 50 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
            <span className="text-xs font-mono text-zinc-500 w-12 text-left">{bar.score}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 mt-4 text-xs text-zinc-700">
        {scannedAt && <span>Scanned {new Date(scannedAt).toLocaleString()}</span>}
        {isCached && <span className="inline-flex items-center rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-500">Served from cache</span>}
      </div>
    </div>
  );
}
