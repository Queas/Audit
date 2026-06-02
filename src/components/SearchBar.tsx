'use client';

import { useState, FormEvent } from "react";
import { Search, Loader2, AlertTriangle } from "lucide-react";

interface SearchBarProps {
  onScan: (url: string) => void;
  isLoading: boolean;
  remaining: number | null;
  rateLimited: boolean;
  resetsAt: string | null;
}

export function SearchBar({ onScan, isLoading, remaining, rateLimited, resetsAt }: SearchBarProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isLoading || rateLimited) return;
    onScan(url.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter a URL to analyze..."
            disabled={isLoading || rateLimited}
            className="w-full h-12 pl-11 pr-32 bg-zinc-900/80 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#00d4aa]/50 focus:ring-1 focus:ring-[#00d4aa]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!url.trim() || isLoading || rateLimited}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 bg-[#00d4aa] text-black text-sm font-medium rounded-md hover:bg-[#00b894] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Scanning
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-between mt-2">
        {remaining !== null && !rateLimited && (
          <p className="text-xs text-zinc-600">
            {remaining} scan{remaining !== 1 ? "s" : ""} remaining today
          </p>
        )}
        {rateLimited && resetsAt && (
          <p className="text-xs text-amber-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            You&apos;ve used your 5 free scans today. Come back tomorrow.
          </p>
        )}
        {remaining === null && !rateLimited && <span />}
      </div>
    </div>
  );
}
