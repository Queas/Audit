'use client';

import { FileText } from "lucide-react";
import type { WHOISResult } from "@/types/scan";

interface Props {
  data: WHOISResult | null;
}

export function WHOISCard({ data }: Props) {
  if (!data) return null;

  const hasData = data.registrar || data.registrationDate || data.expirationDate || data.domainAge;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-4 w-4 text-[#00d4aa]" />
        <h3 className="text-sm font-medium text-zinc-200">WHOIS Intelligence</h3>
      </div>
      {!hasData ? (
        <p className="text-sm text-zinc-500">WHOIS data unavailable</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          {data.registrar && (
            <div className="col-span-2">
              <div className="text-xs text-zinc-500 mb-1">Registrar</div>
              <div className="text-zinc-300 font-mono">{data.registrar}</div>
            </div>
          )}
          {data.registrationDate && (
            <div>
              <div className="text-xs text-zinc-500 mb-1">Registered</div>
              <div className="text-zinc-300 font-mono">{new Date(data.registrationDate).toLocaleDateString()}</div>
            </div>
          )}
          {data.expirationDate && (
            <div>
              <div className="text-xs text-zinc-500 mb-1">Expires</div>
              <div className="text-zinc-300 font-mono">{new Date(data.expirationDate).toLocaleDateString()}</div>
            </div>
          )}
          {data.domainAge && (
            <div className="col-span-2">
              <div className="text-xs text-zinc-500 mb-1">Domain Age</div>
              <div className="text-zinc-300 font-mono">{data.domainAge}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
