'use client';

import { Link2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { BrokenLinksResult } from "@/types/scan";

interface Props {
  data: BrokenLinksResult | null;
}

export function BrokenLinksCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">Broken Links</h3>
        </div>
        {data.brokenCount > 0 ? (
          <StatusBadge status="broken" />
        ) : (
          <StatusBadge status="ok" />
        )}
      </div>
      <p className="text-xs text-zinc-500 mb-3">
        Checked {data.checked} of {data.total} internal links — {data.brokenCount} broken
      </p>
      {data.links.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {data.links.map((link, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-mono truncate max-w-[250px]">{link.url}</span>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="text-zinc-600">{link.statusCode || "ERR"}</span>
                <StatusBadge status={link.label} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
