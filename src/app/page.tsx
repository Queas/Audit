'use client';

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SearchBar } from "@/components/SearchBar";
import { ScoreHeader } from "@/components/ScoreHeader";
import { ResultsGrid } from "@/components/ResultsGrid";
import type { ScanResponse } from "@/types/scan";

export default function Home() {
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [resetsAt, setResetsAt] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.status === 429) {
        const data = await response.json();
        setRateLimited(true);
        setResetsAt(data.resetsAt);
        throw new Error(data.message);
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Scan failed");
      }

      return response.json() as Promise<ScanResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
      setRemaining(data.rateLimit.remaining);
      setRateLimited(false);
    },
    onError: (error) => {
      console.error("Scan error:", error);
    },
  });

  const handleScan = (url: string) => {
    mutation.mutate(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Website Intelligence
          </h1>
          <p className="text-sm text-zinc-600 mb-8">
            SSL · DNS · Security Headers · SEO · Performance · Mixed Content · Uptime · WHOIS — one scan, no account.
          </p>
          <SearchBar
            onScan={handleScan}
            isLoading={mutation.isPending}
            remaining={remaining}
            rateLimited={rateLimited}
            resetsAt={resetsAt}
          />
        </div>

        {mutation.error && (
          <div className="max-w-md mx-auto mb-8 text-center">
            <p className="text-sm text-red-400">{mutation.error.message}</p>
          </div>
        )}

        {result && (
          <>
            <ScoreHeader
              scores={result.ai?.score || null}
              scannedAt={result.scannedAt}
              isCached={result.cached}
            />
            <ResultsGrid
              result={result}
              isLoading={false}
            />
          </>
        )}

        {mutation.isPending && (
          <ResultsGrid
            result={null}
            isLoading={true}
          />
        )}
      </div>
    </div>
  );
}
