"use client";

import { useLiveScores } from "@/context/LiveScoresContext";

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `il y a ${sec}s`;
  return `il y a ${Math.floor(sec / 60)} min`;
}

export function LiveStatusBar() {
  const { data, loading, pollIntervalMs, refresh } = useLiveScores();

  if (loading && !data) {
    return (
      <div className="mb-4 rounded-card border border-fifa-blue/20 bg-fifa-blue/5 px-4 py-2 text-xs text-fifa-blue">
        Connexion aux scores en direct…
      </div>
    );
  }

  if (!data) return null;

  const isLive = data.liveCount > 0;

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-card border px-4 py-2.5 text-xs ${
        isLive
          ? "border-dz-red/40 bg-dz-red/5"
          : "border-fifa-blue/20 bg-fifa-blue/5"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-dz-red">
            <span className="h-2 w-2 animate-pulse rounded-full bg-dz-red" />
            {data.liveCount} match{data.liveCount > 1 ? "s" : ""} en direct
          </span>
        ) : (
          <span className="font-semibold text-fifa-blue">
            Scores{" "}
            {data.source === "espn"
              ? "ESPN (gratuit · ~15s)"
              : "statiques"}
          </span>
        )}
        <span className="text-ink-tertiary">
          · MAJ {timeAgo(data.updatedAt)}
          · refresh {pollIntervalMs / 1000}s
        </span>
        {data.error && (
          <span className="text-dz-red">· {data.error}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => refresh()}
        className="rounded border border-fifa-blue/30 px-2 py-1 font-semibold text-fifa-blue transition hover:bg-fifa-blue hover:text-white"
      >
        Actualiser
      </button>
    </div>
  );
}
