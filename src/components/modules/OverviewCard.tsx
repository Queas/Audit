'use client';

import { Globe, ExternalLink } from "lucide-react";
import type { OverviewResult } from "@/types/scan";

interface Props {
  data: OverviewResult | null;
}

export function OverviewCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">Website Overview</h3>
        </div>
      </div>
      <div className="space-y-3">
        {data.pageTitle && (
          <div>
            <div className="text-xs text-zinc-500 mb-1">Page Title</div>
            <div className="text-sm text-zinc-300 font-mono truncate">{data.pageTitle}</div>
          </div>
        )}
        {data.metaDescription && (
          <div>
            <div className="text-xs text-zinc-500 mb-1">Meta Description</div>
            <div className="text-sm text-zinc-300 font-mono line-clamp-2">{data.metaDescription}</div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {data.cms && (
            <div>
              <div className="text-xs text-zinc-500 mb-1">CMS/Framework</div>
              <div className="text-sm text-zinc-300 font-mono">{data.cms}</div>
            </div>
          )}
          {data.favicon && (
            <div>
              <div className="text-xs text-zinc-500 mb-1">Favicon</div>
              <div className="text-sm text-zinc-300 font-mono truncate">
                <a href={data.favicon} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[#00d4aa] transition-colors">
                  <ExternalLink className="h-3 w-3" /> View
                </a>
              </div>
            </div>
          )}
        </div>
        {data.canonicalUrl && (
          <div>
            <div className="text-xs text-zinc-500 mb-1">Canonical URL</div>
            <div className="text-sm text-zinc-300 font-mono truncate">{data.canonicalUrl}</div>
          </div>
        )}
      </div>
    </div>
  );
}
