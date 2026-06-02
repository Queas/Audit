'use client';

import { AlertTriangle } from "lucide-react";

interface ErrorCardProps {
  title: string;
  message?: string;
}

export function ErrorCard({ title, message }: ErrorCardProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
          {message && (
            <p className="text-xs text-zinc-600 mt-1">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
