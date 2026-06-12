"use client";

import { useLiveScores } from "@/context/LiveScoresContext";

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)} min`;
}

export function LiveStatusBar() {
  const { data, loading, pollIntervalMs, refresh } = useLiveScores();

  if (loading && !data) {
    return (
      <div className="mb-6 rounded-card border border-line-soft bg-surface-muted px-4 py-2.5 text-sm text-ink-secondary">
        Chargement des scores…
      </div>
    );
  }

  if (!data) return null;

  const isLive = data.liveCount > 0;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line-soft bg-surface px-4 py-2.5 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-secondary">
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 font-medium text-red-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            {data.liveCount} en direct
          </span>
        ) : (
          <span>
            Source {data.source === "espn" ? "ESPN" : "statique"}
          </span>
        )}
        <span className="text-ink-tertiary">
          MAJ {timeAgo(data.updatedAt)} · {pollIntervalMs / 1000}s
        </span>
        {data.error && (
          <span className="text-red-600">{data.error}</span>
        )}
      </div>
      <button type="button" onClick={() => refresh()} className="btn-secondary">
        Actualiser
      </button>
    </div>
  );
}
