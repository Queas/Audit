'use client';

import { Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SEOResult } from "@/types/scan";

interface Props {
  data: SEOResult | null;
}

const metricLabels: Record<string, string> = {
  titleLength: "Title Length",
  metaDescriptionLength: "Meta Description",
  h1Count: "H1 Tags",
  openGraphTags: "Open Graph",
  twitterCard: "Twitter Card",
  canonicalTag: "Canonical Tag",
  robotsTxt: "Robots.txt",
  sitemap: "Sitemap",
  imageAltCoverage: "Image Alt Text",
};

export function SEOCard({ data }: Props) {
  if (!data) return null;

  const metrics = data.metrics;

  type MetricEntry = { value: number | boolean; status: string };
  const formatValue = (key: string, metric: MetricEntry): string => {
    if (key === "titleLength") return `${metric.value} chars`;
    if (key === "metaDescriptionLength") return `${metric.value} chars`;
    if (key === "h1Count") return `${metric.value} H1`;
    if (key === "openGraphTags") return `${metric.value}/4 tags`;
    if (key === "twitterCard") return metric.value ? "Present" : "Missing";
    if (key === "canonicalTag") return metric.value ? "Present" : "Missing";
    if (key === "robotsTxt") return metric.value ? "Found" : "Not found";
    if (key === "sitemap") return metric.value ? "Found" : "Not found";
    if (key === "imageAltCoverage") return `${metric.value}%`;
    return String(metric.value);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">SEO Audit</h3>
        </div>
        <span className="text-sm font-mono text-zinc-400">
          Score: <span className={data.score >= 80 ? "text-[#00d4aa]" : data.score >= 50 ? "text-amber-400" : "text-red-400"}>{data.score}</span>
        </span>
      </div>
      <div className="space-y-2">
        {Object.entries(metrics).map(([key, metric]: [string, { value: number | boolean; status: string }]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="text-sm text-zinc-300">{metricLabels[key as keyof typeof metricLabels] || key}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-mono">{formatValue(key, metric)}</span>
              <StatusBadge status={metric.status} className="shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
