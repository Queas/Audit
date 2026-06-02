export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-zinc-800" />
          <div className="h-4 w-32 rounded bg-zinc-800" />
        </div>
        <div className="h-5 w-16 rounded-full bg-zinc-800" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-3/4 rounded bg-zinc-800" />
        <div className="h-3 w-1/2 rounded bg-zinc-800" />
      </div>
    </div>
  );
}
