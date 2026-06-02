'use client';

import { Shield } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SSLResult } from "@/types/scan";

interface Props {
  data: SSLResult | null;
}

export function SSLCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#00d4aa]" />
          <h3 className="text-sm font-medium text-zinc-200">SSL Certificate</h3>
        </div>
        <StatusBadge status={data.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-zinc-500 mb-1">Issuer</div>
          <div className="text-zinc-300 font-mono">{data.issuer || "N/A"}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">TLS Version</div>
          <div className="text-zinc-300 font-mono">{data.tlsVersion || "N/A"}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Expires</div>
          <div className="text-zinc-300 font-mono">
            {data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : "N/A"}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500 mb-1">Days Remaining</div>
          <div className="text-zinc-300 font-mono">
            {data.daysRemaining !== null ? `${data.daysRemaining} days` : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}
